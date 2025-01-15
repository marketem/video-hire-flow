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

  const { data: candidate, isLoading: isLoadingCandidate, error: candidateError } = useQuery<Candidate>({
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
