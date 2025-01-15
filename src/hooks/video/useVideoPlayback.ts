import { useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function useVideoPlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  const resetVideoElement = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      videoRef.current.srcObject = null
      videoRef.current.src = ""
      videoRef.current.load()
    }
  }

  const setupVideoPreview = async (stream: MediaStream) => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.muted = true
      await videoRef.current.play()
    }
  }

  const setupVideoPlayback = (blob: Blob) => {
    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.src = URL.createObjectURL(blob)
      videoRef.current.muted = false
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

  return {
    videoRef,
    isPlaying,
    resetVideoElement,
    setupVideoPreview,
    setupVideoPlayback,
    togglePlayback,
  }
}