import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ViewJobDialogProps {
  job: {
    id: string
    title: string
    department: string
    location: string
    status: string
    description: string
    created_at: string
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewJobDialog({ job, open, onOpenChange }: ViewJobDialogProps) {
  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{job.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Department</h4>
            <p className="text-sm text-muted-foreground">{job.department}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Location</h4>
            <p className="text-sm text-muted-foreground">{job.location}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Status</h4>
            <span 
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                job.status === 'open' 
                  ? 'ring-green-600/20 bg-green-50 text-green-700'
                  : 'ring-red-600/20 bg-red-50 text-red-700'
              }`}
            >
              {job.status}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Created</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}