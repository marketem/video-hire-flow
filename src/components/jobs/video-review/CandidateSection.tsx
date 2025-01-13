import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { CandidateStatusBadge } from "../candidates/CandidateStatusBadge"
import type { Candidate } from "@/types/candidate"

interface CandidateSectionProps {
  title: string
  candidates: Candidate[]
  showActions?: boolean
  onVideoReview: (videoPath: string, candidateName: string) => void
  onStatusChange?: (candidateId: string, status: "reviewing" | "rejected" | "approved") => void
}

export function CandidateSection({ 
  title, 
  candidates, 
  showActions, 
  onVideoReview,
  onStatusChange 
}: CandidateSectionProps) {
  if (candidates.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id} 
            className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
          >
            <div>
              <h4 className="font-medium">{candidate.name}</h4>
              <div className="mt-1">
                <CandidateStatusBadge status={candidate.status} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {candidate.video_url && (
                <Button
                  variant="outline"
                  onClick={() => onVideoReview(candidate.video_url!, candidate.name)}
                >
                  Watch Video
                </Button>
              )}
              {showActions && onStatusChange && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStatusChange(candidate.id, "approved")}
                    className="text-green-600 hover:text-green-700"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onStatusChange(candidate.id, "rejected")}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}