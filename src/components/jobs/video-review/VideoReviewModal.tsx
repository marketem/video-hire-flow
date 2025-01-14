import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CandidateSection } from "./CandidateSection"
import { useVideoReview } from "./useVideoReview"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"
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
  const {
    readyForReview,
    awaitingResponse,
    approvedCandidates,
    rejectedCandidates,
    handleReviewAction,
    getVideoUrl
  } = useVideoReview(jobId)

  const [activeVideo, setActiveVideo] = useState<{ url: string; name: string } | null>(null)

  const handleVideoClick = async (videoPath: string, candidateName: string) => {
    const url = await getVideoUrl(videoPath, candidateName)
    if (url) {
      setActiveVideo({ url, name: candidateName })
    }
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

        {activeVideo ? (
          <div className="space-y-4">
            <button 
              onClick={() => setActiveVideo(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to candidates</span>
            </button>
            <h3 className="text-lg font-semibold">{activeVideo.name}</h3>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                controls 
                autoPlay
                playsInline
                preload="auto"
                className="w-full h-full"
                crossOrigin="anonymous"
              >
                <source src={activeVideo.url} type="video/webm" />
                <source src={activeVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        ) : (
          <Accordion type="single" defaultValue="ready-for-review" className="space-y-4">
            <AccordionItem value="ready-for-review" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-lg font-semibold">
                  Ready for Review ({readyForReview.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CandidateSection
                  title=""
                  candidates={readyForReview}
                  showActions
                  onVideoReview={handleVideoClick}
                  onStatusChange={handleReviewAction}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="approved" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-lg font-semibold">
                  Approved Candidates ({approvedCandidates.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CandidateSection
                  title=""
                  candidates={approvedCandidates}
                  onVideoReview={handleVideoClick}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="awaiting" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-lg font-semibold">
                  Awaiting Response ({awaitingResponse.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CandidateSection
                  title=""
                  candidates={awaitingResponse}
                  onVideoReview={handleVideoClick}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rejected" className="border-none">
              <AccordionTrigger className="hover:no-underline">
                <span className="text-lg font-semibold">
                  Rejected Candidates ({rejectedCandidates.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <CandidateSection
                  title=""
                  candidates={rejectedCandidates}
                  onVideoReview={handleVideoClick}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  )
}