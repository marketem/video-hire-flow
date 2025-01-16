import { useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useMediaStream() {
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const getStream = async () => {
    try {
      // First check if we already have a stream and stop it
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
      streamRef.current.getTracks().forEach(track => {
        track.stop()
      })
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