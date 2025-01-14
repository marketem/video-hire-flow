import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useVideoRecording() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout>()
  const streamRef = useRef<MediaStream | null>(null)
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

  const resetVideoElement = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      videoRef.current.srcObject = null
      videoRef.current.src = ""
      videoRef.current.load()
    }
  }

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4'
    ]
    
    return types.find(type => MediaRecorder.isTypeSupported(type)) || ''
  }

  const startRecording = async () => {
    try {
      console.log("Starting recording process...")
      resetVideoElement()
      
      // First check if we already have a stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      console.log("Requesting media devices...")
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        },
        audio: true 
      })
      
      console.log("Media stream obtained successfully")
      streamRef.current = stream
      
      if (videoRef.current) {
        console.log("Setting up video preview...")
        videoRef.current.srcObject = stream
        videoRef.current.muted = true
        await videoRef.current.play()
      }

      const mimeType = getSupportedMimeType()
      if (!mimeType) {
        throw new Error("No supported video MIME type found in this browser")
      }
      
      console.log("Creating MediaRecorder with MIME type:", mimeType)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType
      })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onerror = (event: Event) => {
        console.error('MediaRecorder error:', event)
        toast({
          title: "Recording Error",
          description: "An error occurred while recording. Please try again.",
          variant: "destructive",
        })
      }

      mediaRecorder.onstop = () => {
        console.log("Recording stopped, creating blob...")
        const blob = new Blob(chunksRef.current, { type: mimeType })
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        setRecordedBlob(blob)
        
        // Set up video for playback
        if (videoRef.current) {
          videoRef.current.srcObject = null
          videoRef.current.src = URL.createObjectURL(blob)
          videoRef.current.muted = false
        }
      }

      console.log("Starting MediaRecorder...")
      mediaRecorder.start()
      setIsRecording(true)
      setTimeLeft(30)
      
    } catch (error) {
      console.error('Error during recording setup:', error)
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          toast({
            title: "Permission Denied",
            description: "Camera access was denied. Please allow camera and microphone access in your browser settings.",
            variant: "destructive",
          })
        } else if (error.name === 'NotFoundError') {
          toast({
            title: "Device Not Found",
            description: "No camera or microphone found. Please ensure your devices are properly connected.",
            variant: "destructive",
          })
        } else if (error.name === 'NotReadableError') {
          toast({
            title: "Hardware Error",
            description: "Your camera or microphone may be in use by another application.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Camera Error",
            description: `Error accessing media devices: ${error.message}`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Recording Error",
          description: "An unexpected error occurred while setting up the recording.",
          variant: "destructive",
        })
      }
    }
  }

  const stopRecording = () => {
    console.log("Stopping recording...")
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(err => {
          console.error('Error during playback:', err)
          toast({
            title: "Playback Error",
            description: "An error occurred while playing the video.",
            variant: "destructive",
          })
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const resetRecording = () => {
    resetVideoElement()
    setRecordedBlob(null)
  }

  return {
    isRecording,
    recordedBlob,
    isPlaying,
    timeLeft,
    videoRef,
    startRecording,
    stopRecording,
    togglePlayback,
    resetRecording,
    resetVideoElement
  }
}