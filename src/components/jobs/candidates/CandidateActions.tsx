import { ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Candidate } from "@/types/candidate"
import { useIsMobile } from "@/hooks/use-mobile"

interface CandidateActionsProps {
  candidate: Candidate
  showActions: boolean
  onVideoClick: () => void
  onStatusChange?: (status: 'reviewing' | 'rejected' | 'approved') => void
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

  const handleApprove = () => {
    console.log('Approve button clicked')
    if (onStatusChange) {
      onStatusChange('approved')
    }
  }

  const handleReject = () => {
    console.log('Reject button clicked')
    if (onStatusChange) {
      onStatusChange('rejected')
    }
  }

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
      </div>
      {showActions && onStatusChange && (
        <div className="flex gap-2 flex-1 sm:flex-initial">
          {isMobile ? (
            <div className="w-full px-2">
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
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={handleApprove}
                className="flex-1 sm:flex-initial bg-[#E5F7D3] hover:bg-[#D8F0C0]"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReject}
                className="flex-1 sm:flex-initial bg-[#FFE5E5] hover:bg-[#FFD6D6] text-[#ea384c]"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}