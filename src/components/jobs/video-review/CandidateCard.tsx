import { Button } from "@/components/ui/button"
import { Phone, ThumbsDown, ThumbsUp } from "lucide-react"
import { format } from "date-fns"
import type { Candidate } from "@/types/candidate"
import { useState } from "react"

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
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleVideoClick = async () => {
    if (isVideoOpen) {
      setIsVideoOpen(false);
      setVideoUrl(null);
    } else {
      const url = await onVideoReview(candidate.video_url!, candidate.name);
      if (url) {
        setVideoUrl(url);
        setIsVideoOpen(true);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div>
          <h4 className="font-medium">{candidate.name}</h4>
          <p className="text-sm text-muted-foreground">{candidate.email}</p>
          {candidate.video_url && (
            <p className="text-xs text-muted-foreground">
              Uploaded {format(new Date(candidate.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {candidate.video_url && (
            <Button
              variant="secondary"
              onClick={handleVideoClick}
            >
              {isVideoOpen ? 'Close Video' : 'Review Video'}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(`tel:${candidate.phone}`, '_blank')}
          >
            <Phone className="h-4 w-4" />
          </Button>
          {showActions && onStatusChange && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onStatusChange(candidate.id, 'approved')}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onStatusChange(candidate.id, 'rejected')}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      {isVideoOpen && videoUrl && (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video 
            controls 
            autoPlay
            playsInline
            preload="auto"
            className="w-full h-full"
            crossOrigin="anonymous"
          >
            <source src={videoUrl} type="video/webm" />
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  )
}