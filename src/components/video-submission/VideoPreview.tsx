import { useRef, useEffect } from "react"
import { Play } from "lucide-react"

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  recordedBlob: Blob | null
  isPlaying: boolean
  isRecording: boolean
  togglePlayback: () => void
}

export function VideoPreview({ 
  videoRef, 
  recordedBlob, 
  isPlaying, 
  isRecording,
  togglePlayback 
}: VideoPreviewProps) {
  return (
    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-cover"
        onEnded={() => setIsPlaying(false)}
      />
      {recordedBlob && !isPlaying && !isRecording && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={togglePlayback}
        >
          <Play className="w-16 h-16 text-white" />
        </div>
      )}
    </div>
  )
}