import { useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useMediaStream() {
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const getStream = async () => {
    try {
      // First check if we already have a stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      console.log("Requesting media devices...")
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 24, max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        }
      })
      
      console.log("Media stream obtained successfully")
      streamRef.current = stream

      // After getting the stream, apply constraints to reduce bitrate
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        try {
          await videoTrack.applyConstraints({
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 30 }
          })
        } catch (error) {
          console.warn('Could not apply additional video constraints:', error)
        }
      }

      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      
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
        }
      }
      throw error
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [])

  return {
    getStream,
    stopStream,
  }
}