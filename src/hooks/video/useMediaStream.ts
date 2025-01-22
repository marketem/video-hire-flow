import { useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useMediaStream() {
  const streamRef = useRef<MediaStream | null>(null)
  const { toast } = useToast()

  const getStream = async () => {
    try {
      // First check if we already have a stream
      if (streamRef.current) {
        console.log("Stopping existing stream...")
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      console.log("Checking media devices permissions...")
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      console.log("Available video devices:", videoDevices)

      if (videoDevices.length === 0) {
        throw new Error("No video devices found")
      }

      console.log("Requesting media stream with constraints...")
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

      // Log active tracks for debugging
      stream.getTracks().forEach(track => {
        console.log(`Active track: ${track.kind}, enabled: ${track.enabled}, state: ${track.readyState}`)
      })

      // After getting the stream, apply constraints to reduce bitrate
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        try {
          console.log("Applying additional video constraints...")
          await videoTrack.applyConstraints({
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 24, max: 30 }
          })
          console.log("Video constraints applied successfully")
        } catch (error) {
          console.warn('Could not apply additional video constraints:', error)
        }
      }

      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          console.log('Permission denied error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
          toast({
            title: "Camera Access Denied",
            description: "Please ensure camera access is allowed in your browser settings. You may need to refresh the page after enabling permissions.",
            variant: "destructive",
          })
        } else if (error.name === 'NotFoundError') {
          toast({
            title: "Camera Not Found",
            description: "No camera detected. Please connect a camera and refresh the page.",
            variant: "destructive",
          })
        } else if (error.name === 'NotReadableError') {
          toast({
            title: "Camera Error",
            description: "Cannot access your camera. It may be in use by another application.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Camera Error",
            description: `Unexpected error: ${error.name}. Please refresh the page and try again.`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Camera Error",
          description: "An unexpected error occurred while accessing your camera. Please refresh and try again.",
          variant: "destructive",
        })
      }
      throw error
    }
  }

  const stopStream = () => {
    if (streamRef.current) {
      console.log("Stopping all media tracks...")
      streamRef.current.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`)
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