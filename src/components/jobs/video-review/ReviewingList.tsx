import { VideoSubmissionCard } from "./VideoSubmissionCard"
import { type Candidate } from "@/types/candidate"

interface ReviewingListProps {
  candidates: (Candidate & { job_openings: { title: string } })[]
}

export function ReviewingList({ candidates }: ReviewingListProps) {
  if (!candidates.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No candidates currently under review
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {candidates.map((candidate) => (
        <VideoSubmissionCard key={candidate.id} submission={candidate} />
      ))}
    </div>
  )
}