import { Clock } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import type { Candidate } from "@/types/candidate"

interface CandidateInfoProps {
  candidate: Candidate
}

export function CandidateInfo({ candidate }: CandidateInfoProps) {
  const waitingTime = formatDistanceToNow(new Date(candidate.created_at))

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-start">
        <h4 className="font-medium">{candidate.name}</h4>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {waitingTime}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{candidate.email}</p>
      {candidate.video_url && (
        <p className="text-xs text-muted-foreground">
          Uploaded {format(new Date(candidate.created_at), "MMM d, yyyy 'at' h:mm a")}
        </p>
      )}
    </div>
  )
}