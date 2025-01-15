import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateJobDialog } from "./CreateJobDialog"
import { JobOpeningsList } from "./JobOpeningsList"
import { useJobOpenings } from "./useJobOpenings"

export function JobOpenings() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { jobs, fetchJobs } = useJobOpenings()

  const handleJobCreated = () => {
    setIsCreateDialogOpen(false)
    fetchJobs()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-2xl font-semibold tracking-tight">Request Videos</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className={jobs.length === 0 ? 'w-full sm:w-auto' : 'w-auto'}
          size={jobs.length === 0 ? "default" : "sm"}
          variant="default"
        >
          <Plus className={jobs.length === 0 ? "mr-2 h-4 w-4" : "mr-1 h-3 w-3"} />
          {jobs.length === 0 ? "Create Job Opening" : "Job"}
        </Button>
      </div>
      <JobOpeningsList />
      <CreateJobDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onJobCreated={handleJobCreated}
      />
    </div>
  )
}