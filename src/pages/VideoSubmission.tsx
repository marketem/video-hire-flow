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
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { format } from "date-fns"

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
    initializeCamera
  } = useVideoRecording()

  console.log('Current token from URL:', token)

  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ['candidate', token],
    queryFn: async () => {
      if (!token) {
        console.error('No token provided')
        throw new Error('No token provided')
      }
      
      console.log('Attempting to fetch candidate with token:', token)
      
      // First set the video token in the request context
      const { error: tokenError } = await supabase.rpc('set_request_video_token', {
        token: token
      })

      if (tokenError) {
        console.error('Error setting video token:', tokenError)
        throw tokenError
      }
      
      // Then fetch the candidate using the token
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('video_token', token)
        .single()

      if (error) {
        console.error('Error fetching candidate:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('Successfully fetched candidate:', data)
      return data
    },
    enabled: !!token,
    retry: false,
    meta: {
      onError: () => {
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
    if (!recordedBlob || !candidate?.id) return
    setUploadError(null)
    setIsUploading(true)

    try {
      console.log('Starting upload process...')
      console.log('Blob size:', recordedBlob.size)
      console.log('Blob type:', recordedBlob.type)
      
      // Log complete candidate data for debugging
      console.log('Full candidate data:', candidate)
      
      // Get and validate token from URL
      const urlToken = searchParams.get('token')
      console.log('Token from URL:', urlToken)
      console.log('Token from candidate:', candidate.video_token)
      console.log('Token match:', urlToken === candidate.video_token)

      // Log JWT claims
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        console.error('Error getting session:', sessionError)
      } else {
        console.log('Session data:', {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          claims: session?.access_token ? 
            JSON.parse(atob(session.access_token.split('.')[1])) : 
            'No claims available'
        })
      }

      if (recordedBlob.size > MAX_FILE_SIZE) {
        throw new Error(`Video size (${Math.round(recordedBlob.size / (1024 * 1024))}MB) exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
      }

      const extension = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm'
      const fileName = `${candidate.id}-${Date.now()}.${extension}`
      
      console.log('Uploading file:', fileName)

      const file = new File([recordedBlob], fileName, {
        type: recordedBlob.type
      })

      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: recordedBlob.type
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw uploadError
      }

      console.log('Video uploaded successfully:', data)
      console.log('Attempting database update with:', {
        video_url: fileName,
        video_submitted_at: new Date().toISOString(),
        candidate_id: candidate.id,
        using_token: urlToken
      })

      // Try to update with explicit token claim
      const { error: updateError, data: updateData } = await supabase.auth.setSession({
        access_token: session?.access_token || '',
        refresh_token: session?.refresh_token || '',
      })

      if (updateError) {
        console.error('Session update error:', updateError)
      }

      const { error: candidateUpdateError, data: candidateUpdateData } = await supabase
        .from('candidates')
        .update({ 
          video_url: fileName,
          video_submitted_at: new Date().toISOString()
        })
        .eq('id', candidate.id)
        .eq('video_token', urlToken)
        .select()

      if (candidateUpdateError) {
        console.error('Database update error:', candidateUpdateError)
        console.error('Error details:', {
          code: candidateUpdateError.code,
          message: candidateUpdateError.message,
          details: candidateUpdateError.details,
          hint: candidateUpdateError.hint
        })
        throw candidateUpdateError
      }

      console.log('Database update successful:', candidateUpdateData)

      toast({
        title: "Success",
        description: "Your video has been uploaded successfully!",
      })

      navigate('/submission-success', { 
        state: { 
          candidateData: {
            id: candidate.id,
            name: candidate.name,
            email: candidate.email,
            job_id: candidate.job_id
          }
        }
      })
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

  // Show already submitted message if video exists
  if (candidate?.video_url) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Video Already Submitted</h1>
          <p className="text-muted-foreground">
            You have already submitted a video for this application on{' '}
            {format(new Date(candidate.video_submitted_at || candidate.created_at), 'MMMM d, yyyy')} at{' '}
            {format(new Date(candidate.video_submitted_at || candidate.created_at), 'h:mm a')}
          </p>
          <Link 
            to="/" 
            className="inline-block mt-4 text-primary hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="mb-2">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">VibeCheck</span>
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center -mt-8">
        <div className="w-full max-w-md space-y-3">
          <h1 className="text-2xl font-bold text-center">Record Your Introduction</h1>
          <p className="text-muted-foreground text-center mb-2">
            Please record a 30-second video
          </p>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm">Find a quiet, well lit space</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm">Face centered and visible</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm">Briefly introduce yourself and explain why you're interested in this position</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
