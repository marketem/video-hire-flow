import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CandidateSection } from "./CandidateSection"
import { useVideoReview } from "./useVideoReview"

interface VideoReviewModalProps {
  jobId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoReviewModal({ jobId, open, onOpenChange }: VideoReviewModalProps) {
  const {
    readyForReview,
    awaitingResponse,
    approvedCandidates,
    rejectedCandidates,
    handleReviewAction,
    getVideoUrl
  } = useVideoReview(jobId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Candidates</DialogTitle>
          <DialogDescription>
            Review and manage candidate video submissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <CandidateSection
            title="Ready for Review"
            candidates={readyForReview}
            showActions
            onVideoReview={getVideoUrl}
            onStatusChange={handleReviewAction}
          />

          <CandidateSection
            title="Approved Candidates"
            candidates={approvedCandidates}
            onVideoReview={getVideoUrl}
          />

          <CandidateSection
            title="Awaiting Response"
            candidates={awaitingResponse}
            onVideoReview={getVideoUrl}
          />

          <CandidateSection
            title="Rejected Candidates"
            candidates={rejectedCandidates}
            onVideoReview={getVideoUrl}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}