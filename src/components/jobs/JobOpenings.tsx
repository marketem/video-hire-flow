import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CreateJobDialog } from "./CreateJobDialog"
import { JobOpeningsList } from "./JobOpeningsList"
import { useJobOpenings } from "./useJobOpenings"

export function JobOpenings() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { jobs, isLoading, fetchJobs } = useJobOpenings()

  const handleJobCreated = () => {
    setIsCreateDialogOpen(false)
    fetchJobs()
  }

  // Determine button appearance based on jobs existence and loading state
  const showCompactButton = !isLoading && jobs.length > 0
  const buttonText = showCompactButton ? "Job" : "Create Job Opening"
  const buttonSize = showCompactButton ? "sm" : "default"
  const iconSize = showCompactButton ? "h-3 w-3" : "h-4 w-4"
  const buttonClassName = `${showCompactButton ? '' : 'w-full sm:w-auto'}`

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">Request Videos</h2>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className={buttonClassName}
          size={buttonSize}
          variant="default"
        >
          <Plus className={`${showCompactButton ? 'mr-1' : 'mr-2'} ${iconSize}`} />
          {buttonText}
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