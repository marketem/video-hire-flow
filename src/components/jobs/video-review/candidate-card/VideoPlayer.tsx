import { useState } from "react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  videoUrl: string | null
  isOpen: boolean
  onClose: () => void
}

export function VideoPlayer({ videoUrl, isOpen, onClose }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!isOpen || !videoUrl) return null

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video 
        controls 
        autoPlay
        playsInline
        preload="auto"
        className="w-full h-full"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={onClose}
      >
        Close Video
      </Button>
    </div>
  )
}