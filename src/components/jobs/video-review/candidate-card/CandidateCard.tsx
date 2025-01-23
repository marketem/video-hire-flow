import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { Candidate } from "@/types/candidate"
import { VideoPlayer } from "./VideoPlayer"
import { CandidateInfo } from "./CandidateInfo"
import { CandidateActions } from "./CandidateActions"

interface CandidateCardProps {
  candidate: Candidate
  showActions?: boolean
  onVideoReview: (videoPath: string, candidateName: string) => Promise<string | null>
  onStatusChange?: (candidateId: string, status: 'reviewing' | 'rejected' | 'approved') => void
}

export function CandidateCard({ 
  candidate, 
  showActions = false, 
  onVideoReview,
  onStatusChange 
}: CandidateCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [sliderValue, setSliderValue] = useState([50])
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const { toast } = useToast()

  const handleVideoClick = async () => {
    if (isVideoOpen) {
      setIsVideoOpen(false)
      setVideoUrl(null)
    } else {
      const url = await onVideoReview(candidate.video_url!, candidate.name)
      if (url) {
        setVideoUrl(url)
        setIsVideoOpen(true)
      }
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !onStatusChange) return

    const touchEnd = e.changedTouches[0].clientX
    const distance = touchEnd - touchStart

    if (Math.abs(distance) > 100) {
      if (distance > 0) {
        onStatusChange(candidate.id, 'approved')
        toast({
          title: "Candidate Approved",
          description: `${candidate.name} has been approved`,
        })
      } else {
        onStatusChange(candidate.id, 'rejected')
        toast({
          title: "Candidate Rejected",
          description: `${candidate.name} has been rejected`,
        })
      }
    }
    setTouchStart(null)
  }

  return (
    <div 
      className="space-y-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col p-4 bg-muted rounded-lg gap-4">
        <CandidateInfo candidate={candidate} />
        <CandidateActions 
          candidate={candidate}
          showActions={showActions}
          onVideoClick={handleVideoClick}
          onStatusChange={onStatusChange}
          sliderValue={sliderValue}
          onSliderChange={setSliderValue}
        />
      </div>
      <VideoPlayer 
        videoUrl={videoUrl}
        isOpen={isVideoOpen}
        onClose={() => {
          setIsVideoOpen(false)
          setVideoUrl(null)
        }}
      />
    </div>
  )
}