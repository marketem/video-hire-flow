import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Phone, ThumbsDown, ThumbsUp, Clock } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import type { Candidate } from "@/types/candidate"
import { useState, useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

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
  const [sliderValue, setSliderValue] = useState([50]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const isMobile = useIsMobile();
  const { toast } = useToast();

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !onStatusChange) return;

    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchEnd - touchStart;

    if (Math.abs(distance) > 100) {
      if (distance > 0) {
        onStatusChange(candidate.id, 'approved');
        toast({
          title: "Candidate Approved",
          description: `${candidate.name} has been approved`,
        });
      } else {
        onStatusChange(candidate.id, 'rejected');
        toast({
          title: "Candidate Rejected",
          description: `${candidate.name} has been rejected`,
        });
      }
    }
    setTouchStart(null);
  };

  useEffect(() => {
    if (sliderValue[0] !== 50 && onStatusChange) {
      const timer = setTimeout(() => {
        onStatusChange(candidate.id, sliderValue[0] > 50 ? 'approved' : 'rejected');
        setSliderValue([50]); // Reset slider
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sliderValue, candidate.id, onStatusChange]);

  const waitingTime = formatDistanceToNow(new Date(candidate.created_at));

  return (
    <div 
      className="space-y-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex flex-col p-4 bg-muted rounded-lg gap-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{candidate.name}</h4>
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {waitingTime}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{candidate.email}</p>
          {candidate.video_url && (
            <p className="text-xs text-muted-foreground">
              Uploaded {format(new Date(candidate.created_at), "MMM d, yyyy 'at' h:mm a")}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex gap-2 flex-1">
            {candidate.video_url && (
              <Button
                variant="secondary"
                className="flex-1 sm:flex-initial"
                onClick={handleVideoClick}
              >
                {isVideoOpen ? 'Close Video' : 'Review Video'}
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial"
              onClick={() => window.open(`tel:${candidate.phone}`, '_blank')}
            >
              <Phone className="h-4 w-4 mr-2" />
              <span>Call Candidate</span>
            </Button>
          </div>
          {showActions && onStatusChange && (
            <div className="flex gap-2 flex-1 sm:flex-initial pt-4">
              {isMobile ? (
                <div className="w-full px-2">
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Reject</span>
                    <span>Approve</span>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onStatusChange(candidate.id, 'approved')}
                    className="flex-1 sm:flex-initial bg-[#E5F7D3] hover:bg-[#D8F0C0]"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onStatusChange(candidate.id, 'rejected')}
                    className="flex-1 sm:flex-initial bg-[#FFE5E5] hover:bg-[#FFD6D6] text-[#ea384c]"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
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