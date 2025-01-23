import { useState, useEffect } from "react"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import type { Candidate } from "@/types/candidate"
import { useIsMobile } from "@/hooks/use-mobile"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"

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
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const updateCandidateStatus = async (status: 'reviewing' | 'rejected' | 'approved') => {
    console.log('Updating candidate status:', { candidateId: candidate.id, status })
    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidate.id)
        .single()

      if (error) throw error

      console.log('Status update successful')
      toast({
        title: "Success",
        description: `Candidate ${status === 'approved' ? 'approved' : 'rejected'}`,
      })

      if (onStatusChange) {
        onStatusChange(status)
      }
    } catch (error) {
      console.error('Error updating candidate status:', error)
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleApprove = () => {
    console.log('Approve button clicked for candidate:', candidate.id)
    updateCandidateStatus('approved')
  }

  const handleReject = () => {
    console.log('Reject button clicked for candidate:', candidate.id)
    updateCandidateStatus('rejected')
  }

  // Monitor slider value changes and trigger status update
  useEffect(() => {
    if (sliderValue[0] !== 50 && !isUpdating) {
      const timer = setTimeout(() => {
        const newStatus = sliderValue[0] > 50 ? 'approved' : 'rejected'
        console.log('Slider triggered status change:', newStatus)
        updateCandidateStatus(newStatus)
        onSliderChange([50]) // Reset slider
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [sliderValue])

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
      {showActions && (
        <div className="flex gap-2 flex-1 sm:flex-initial">
          {isMobile ? (
            <div className="w-full px-2">
              <Slider
                value={sliderValue}
                onValueChange={onSliderChange}
                max={100}
                step={1}
                className="w-full"
                disabled={isUpdating}
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
                disabled={isUpdating}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleReject}
                className="flex-1 sm:flex-initial bg-[#FFE5E5] hover:bg-[#FFD6D6] text-[#ea384c]"
                disabled={isUpdating}
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