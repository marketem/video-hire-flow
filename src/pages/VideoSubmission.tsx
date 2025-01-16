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

  const { data: candidate, isLoading: isLoadingCandidate } = useQuery({
    queryKey: ['candidate', token],
    queryFn: async () => {
      if (!token) throw new Error('No token provided')
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('video_token', token)
        .single()

      if (error) throw error
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
      if (recordedBlob.size > MAX_FILE_SIZE) {
        throw new Error(`Video size (${Math.round(recordedBlob.size / (1024 * 1024))}MB) exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit. Please record a shorter video.`)
      }

      const fileName = `${candidate.id}-${Date.now()}.webm`
      const file = new File([recordedBlob], fileName, {
        type: 'video/webm'
      })

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get job details to include in the notification
      const { data: jobData, error: jobError } = await supabase
        .from('job_openings')
        .select('title, user_id')
        .eq('id', candidate.job_id)
        .single()

      if (jobError) throw jobError

      // Get manager's email from auth.users
      const { data: userData, error: userError } = await supabase.auth
        .admin.getUserById(jobData.user_id)

      if (userError) throw userError

      // Fix: Properly access the email from the user data structure
      const managerEmail = userData.user?.email

      if (!managerEmail) {
        throw new Error('Could not find manager email')
      }

      const { error: updateError } = await supabase
        .from('candidates')
        .update({ 
          video_url: fileName
        })
        .eq('id', candidate.id)

      if (updateError) throw updateError

      // Send email notification with the correct email
      const { error: notificationError } = await supabase.functions
        .invoke('send-video-notification', {
          body: {
            candidateName: candidate.name,
            candidateEmail: candidate.email,
            jobTitle: jobData.title,
            managerEmail: managerEmail // Using the correctly accessed email
          }
        })

      if (notificationError) {
        console.error('Failed to send notification:', notificationError)
        // Don't throw here - we don't want to fail the upload if just the notification fails
      }

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
