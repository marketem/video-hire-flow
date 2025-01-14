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
import { X } from "lucide-react"

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
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{activeVideo.name}</h3>
              <button 
                onClick={() => setActiveVideo(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
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
          <div className="space-y-6">
            <CandidateSection
              title="Ready for Review"
              candidates={readyForReview}
              showActions
              onVideoReview={handleVideoClick}
              onStatusChange={handleReviewAction}
            />

            <CandidateSection
              title="Approved Candidates"
              candidates={approvedCandidates}
              onVideoReview={handleVideoClick}
            />

            <CandidateSection
              title="Awaiting Response"
              candidates={awaitingResponse}
              onVideoReview={handleVideoClick}
            />

            <CandidateSection
              title="Rejected Candidates"
              candidates={rejectedCandidates}
              onVideoReview={handleVideoClick}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}