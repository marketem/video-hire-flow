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

      // First try to enumerate devices to check system permissions
      console.log("Checking system permissions via enumerateDevices...")
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        console.log("All available devices:", devices)
        
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        console.log("Available video devices:", videoDevices)

        // Check if we have labels - no labels usually means no system permission
        const hasSystemPermission = videoDevices.some(device => device.label)
        console.log("Has system permission (based on device labels):", hasSystemPermission)

        if (!hasSystemPermission) {
          console.warn("No system permission detected - device labels are empty")
        }
      } catch (enumError) {
        console.error("Error enumerating devices:", enumError)
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

      // Log detailed track information
      stream.getTracks().forEach(track => {
        console.log("Track details:", {
          kind: track.kind,
          label: track.label,
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          constraints: track.getConstraints(),
          settings: track.getSettings()
        })
      })

      return stream
    } catch (error) {
      console.error('Error accessing media devices:', error)
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          // Log detailed error information
          console.error('System permission denied details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            // Additional system info that might be helpful
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor
          })

          // Check if this is likely a system-level block
          if (error.message.toLowerCase().includes('system')) {
            toast({
              title: "System Camera Access Blocked",
              description: "Your operating system is blocking camera access. Please check your system privacy settings and ensure camera access is allowed for your browser.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Camera Access Denied",
              description: "Please check both browser and system camera permissions, then refresh the page.",
              variant: "destructive",
            })
          }
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
            description: `Unexpected error: ${error.name}. Please refresh and try again.`,
            variant: "destructive",
          })
        }
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