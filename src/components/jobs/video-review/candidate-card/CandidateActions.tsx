import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Candidate } from "@/types/candidate"
import { useIsMobile } from "@/hooks/use-mobile"

interface CandidateActionsProps {
  candidate: Candidate
  showActions: boolean
  onVideoClick: () => void
  onStatusChange?: (candidateId: string, status: 'reviewing' | 'rejected' | 'approved') => void
  sliderValue: number[]
  onSliderChange: (value: number[]) => void
}

export function CandidateActions({ 
  candidate, 
  showActions, 
  onVideoClick, 
  onStatusChange,
  sliderValue,
  onSliderChange
}: CandidateActionsProps) {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex gap-2 flex-1">
        {candidate.video_url && (
          <Button
            variant="secondary"
            className="flex-1 sm:flex-initial"
            onClick={onVideoClick}
          >
            Review Video
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
        <div className="flex gap-2 flex-1 sm:flex-initial">
          {isMobile && (
            <div className="w-full px-2 mt-4 sm:mt-0">
              <Slider
                value={sliderValue}
                onValueChange={onSliderChange}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Reject</span>
                <span>Approve</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}