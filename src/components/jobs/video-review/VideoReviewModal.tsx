import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { CandidateSection } from "./CandidateSection"
import { useVideoReview } from "./useVideoReview"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface VideoReviewModalProps {
  jobId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoReviewModal({ jobId, open, onOpenChange }: VideoReviewModalProps) {
  const isMobile = useIsMobile()
  const {
    readyForReview,
    awaitingResponse,
    approvedCandidates,
    rejectedCandidates,
    handleReviewAction,
    getVideoUrl
  } = useVideoReview(jobId)

  const content = (
    <Accordion type="single" defaultValue="ready-for-review" className="space-y-4">
      <AccordionItem value="ready-for-review" className="border-none">
        <AccordionTrigger className="hover:no-underline focus:outline-none focus-visible:outline-none focus-visible:ring-0">
          <span className="text-lg font-semibold">
            Ready for Review ({readyForReview.length})
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <CandidateSection
            title=""
            candidates={readyForReview}
            showActions
            onVideoReview={getVideoUrl}
            onStatusChange={handleReviewAction}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="approved" className="border-none">
        <AccordionTrigger className="hover:no-underline focus:outline-none focus-visible:outline-none focus-visible:ring-0">
          <span className="text-lg font-semibold">
            Approved Candidates ({approvedCandidates.length})
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <CandidateSection
            title=""
            candidates={approvedCandidates}
            onVideoReview={getVideoUrl}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="awaiting" className="border-none">
        <AccordionTrigger className="hover:no-underline focus:outline-none focus-visible:outline-none focus-visible:ring-0">
          <span className="text-lg font-semibold">
            Awaiting Response ({awaitingResponse.length})
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <CandidateSection
            title=""
            candidates={awaitingResponse}
            onVideoReview={getVideoUrl}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="rejected" className="border-none">
        <AccordionTrigger className="hover:no-underline focus:outline-none focus-visible:outline-none focus-visible:ring-0">
          <span className="text-lg font-semibold">
            Rejected Candidates ({rejectedCandidates.length})
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <CandidateSection
            title=""
            candidates={rejectedCandidates}
            onVideoReview={getVideoUrl}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Review Candidates</SheetTitle>
            <SheetDescription>
              Review and manage candidate video submissions
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Candidates</DialogTitle>
          <DialogDescription>
            Review and manage candidate video submissions
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}