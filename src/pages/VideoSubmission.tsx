import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { VideoPreview } from "@/components/video-submission/VideoPreview"
import { RecordingTimer } from "@/components/video-submission/RecordingTimer"
import { RecordingControls } from "@/components/video-submission/RecordingControls"
import { useVideoRecording } from "@/hooks/useVideoRecording"
import type { Candidate } from "@/types/candidate"

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function VideoSubmission() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [cameraInitialized, setCameraInitialized] = useState(false)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const {
    isRecording,
    recordedBlob,
    isPlaying,
    timeLeft,
    videoRef,
    startRecording,
    stopRecording,
    togglePlayback,
    resetRecording,
    resetVideoElement,
    initializeCamera,
    stopStream
  } = useVideoRecording()

  const { data: candidate, isLoading: isLoadingCandidate, error: candidateError } = useQuery({
    queryKey: ['candidate', token],
    queryFn: async () => {
      if (!token) {
        console.error('No token provided')
        throw new Error('No token provided')
      }
      
      console.log('Fetching candidate with token:', token)
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('video_token', token)
        .maybeSingle()

      if (error) {
        console.error('Error fetching candidate:', error)
        throw error
      }

      if (!data) {
        console.error('No candidate found with token:', token)
        throw new Error('Video has already been submitted')
      }
      
      console.log('Candidate data:', data)
      return data as Candidate
    },
    enabled: !!token,
    retry: false,
    meta: {
      onError: (error: Error) => {
        console.error('Query error:', error)
        toast({
          title: "Error",
          description: "Invalid or expired video submission link",
          variant: "destructive",
        })
        navigate('/')
      }
    }
  })

  const handleUpload = async () => {
    console.log('Starting upload with:', { recordedBlob, candidateId: candidate?.id })
    
    if (!recordedBlob) {
      setUploadError('No video recording found')
      return
    }

    if (!candidate?.id) {
      console.error('No candidate ID available')
      setUploadError('Invalid candidate information')
      return
    }
    
    setUploadError(null)
    setIsUploading(true)

    try {
      if (recordedBlob.size > MAX_FILE_SIZE) {
        throw new Error(`Video size (${Math.round(recordedBlob.size / (1024 * 1024))}MB) exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
      }

      const fileName = `${candidate.id}-${Date.now()}.webm`
      console.log('Creating file with name:', fileName)
      
      const file = new File([recordedBlob], fileName, {
        type: recordedBlob.type || 'video/webm'
      })

      console.log('Uploading file to storage...')
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw uploadError
      }

      console.log('File uploaded successfully, updating candidate record...')
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ 
          video_url: fileName,
          video_token: null
        })
        .eq('id', candidate.id)

      if (updateError) {
        console.error('Database update error:', updateError)
        throw updateError
      }

      stopStream()
      setCameraInitialized(false)

      toast({
        title: "Success",
        description: "Your video has been uploaded successfully!",
      })

      navigate('/submission-success')
    } catch (error) {
      console.error('Upload process error:', error)
      const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again."
      setUploadError(errorMessage)
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleStartCamera = async () => {
    try {
      await initializeCamera()
      setCameraInitialized(true)
    } catch (error) {
      console.error('Camera initialization error:', error)
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check your camera permissions and try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoadingCandidate) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (candidateError || !candidate) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Already Submitted</h1>
          <p className="text-muted-foreground">
            Video has already been submitted. Please contact your hiring manager.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="mb-8">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">VibeCheck</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center">Record Your Introduction</h1>
          <p className="text-muted-foreground text-center mb-8">
            Please record a 30-second video introducing yourself
          </p>

          {uploadError && (
            <Alert variant="destructive">
              <AlertTitle>Upload Error</AlertTitle>
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {isRecording && <RecordingTimer timeLeft={timeLeft} />}

          <VideoPreview
            videoRef={videoRef}
            recordedBlob={recordedBlob}
            isPlaying={isPlaying}
            isRecording={isRecording}
            togglePlayback={togglePlayback}
          />

          <RecordingControls
            isRecording={isRecording}
            recordedBlob={recordedBlob}
            isUploading={isUploading}
            startRecording={startRecording}
            stopRecording={stopRecording}
            handleUpload={handleUpload}
            resetRecording={resetRecording}
            cameraInitialized={cameraInitialized}
            onStartCamera={handleStartCamera}
          />
        </div>
      </div>
    </div>
  )
}