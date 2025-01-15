import { Button } from "@/components/ui/button"
import { Users, ChevronRight } from "lucide-react"
import { JobOpening } from "./types"

interface JobCardProps {
  job: JobOpening
  onManageCandidates: (job: JobOpening) => void
  onOpenActions: (job: JobOpening) => void
}

export function JobCard({ job, onManageCandidates, onOpenActions }: JobCardProps) {
  return (
    <div className="bg-muted/30 p-3 rounded-lg border">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{job.title}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <p className="truncate">{job.location}</p>
              <p className="flex items-center gap-1 shrink-0">
                <Users className="h-4 w-4 stroke-[1.5]" />
                <span>{job.candidates_count} candidates</span>
              </p>
            </div>
          </div>
          <span 
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
              job.status === 'open' 
                ? 'ring-green-600/20 bg-green-50 text-green-700'
                : 'ring-red-600/20 bg-red-50 text-red-700'
            }`}
          >
            {job.status}
          </span>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onManageCandidates(job)}
          >
            <Users className="h-4 w-4 mr-2" />
            Invites
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-white"
            onClick={() => onOpenActions(job)}
          >
            Manage
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}