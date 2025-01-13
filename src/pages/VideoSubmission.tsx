import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { Video, StopCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function VideoSubmission() {
  const { candidateId } = useParams()
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  useEffect(() => {
    if (recordedBlob && videoRef.current) {
      videoRef.current.src = URL.createObjectURL(recordedBlob)
    }
  }, [recordedBlob])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach(track => track.stop())
        if (videoRef.current) {
          videoRef.current.srcObject = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setTimeLeft(30)
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        title: "Error",
        description: "Could not access camera. Please ensure you've granted permission.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handleUpload = async () => {
    if (!recordedBlob || !candidateId) return

    setIsUploading(true)
    try {
      const fileName = `${candidateId}-${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, recordedBlob)

      if (uploadError) throw uploadError

      const { error: updateError } = await supabase
        .from('candidates')
        .update({ video_url: fileName })
        .eq('id', candidateId)

      if (updateError) throw updateError

      toast({
        title: "Success",
        description: "Your video has been uploaded successfully!",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Record Your Introduction</h1>
        <p className="text-muted-foreground text-center mb-8">
          Please record a 30-second video introducing yourself
        </p>

        {isRecording && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Time remaining:</span>
              <span className="text-sm font-medium">{timeLeft}s</span>
            </div>
            <Progress value={((30 - timeLeft) / 30) * 100} />
          </div>
        )}

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isRecording}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex justify-center gap-4">
          {!isRecording && !recordedBlob && (
            <Button onClick={startRecording} className="w-full">
              <Video className="mr-2 h-4 w-4" />
              Start Recording
            </Button>
          )}
          
          {isRecording && (
            <Button onClick={stopRecording} variant="destructive" className="w-full">
              <StopCircle className="mr-2 h-4 w-4" />
              Stop Recording
            </Button>
          )}

          {recordedBlob && !isUploading && (
            <>
              <Button onClick={() => setRecordedBlob(null)} variant="outline">
                Record Again
              </Button>
              <Button onClick={handleUpload}>
                Upload Video
              </Button>
            </>
          )}

          {isUploading && (
            <Button disabled className="w-full">
              Uploading...
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}