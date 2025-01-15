import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CreateJobDialog } from "./CreateJobDialog"
import { JobOpeningsList } from "./JobOpeningsList"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export function JobOpenings() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleJobCreated = () => {
    setIsCreateDialogOpen(false)
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold tracking-tight">Request Videos</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Job Opening
          </Button>
        </div>
        <JobOpeningsList />
        <CreateJobDialog 
          onJobCreated={handleJobCreated}
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </ErrorBoundary>
  )
}