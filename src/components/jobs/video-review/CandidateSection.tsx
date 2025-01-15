import type { Candidate } from "@/types/candidate"
import { CandidateCard } from "./CandidateCard"

interface CandidateSectionProps {
  title: string
  candidates: Candidate[]
  showActions?: boolean
  onVideoReview: (videoPath: string, candidateName: string) => Promise<string | null>
  onStatusChange?: (candidateId: string, status: 'reviewing' | 'rejected' | 'approved') => void
}

export function CandidateSection({
  title,
  candidates,
  showActions = false,
  onVideoReview,
  onStatusChange
}: CandidateSectionProps) {
  return (
    <section>
      {title && <h3 className="font-semibold mb-4">{title}</h3>}
      <div className="space-y-4">
        {candidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            showActions={showActions}
            onVideoReview={onVideoReview}
            onStatusChange={onStatusChange}
          />
        ))}
        {candidates.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No candidates in this category
          </p>
        )}
      </div>
    </section>
  )
}