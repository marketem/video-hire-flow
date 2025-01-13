import { VideoSubmissionCard } from "./VideoSubmissionCard"
import { type Candidate } from "@/types/candidate"

interface VideoSubmissionsListProps {
  submissions: (Candidate & { job_openings: { title: string } })[]
}

export function VideoSubmissionsList({ submissions }: VideoSubmissionsListProps) {
  if (!submissions.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No new video submissions to review
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => (
        <VideoSubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  )
}