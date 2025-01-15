import { useEffect } from "react"
import { ViewJobDialog } from "./ViewJobDialog"
import { EditJobDialog } from "./EditJobDialog"
import { CandidatesModal } from "./CandidatesModal"
import { JobOpening } from "./types"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { JobCard } from "./JobCard"
import { JobTable } from "./JobTable"

interface JobOpeningsListProps {
  jobs: JobOpening[]
  isLoading: boolean
  fetchJobs: () => void
}

export function JobOpeningsList({ jobs, isLoading, fetchJobs }: JobOpeningsListProps) {
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState<JobOpening | null>(null)
  const [isActionsSheetOpen, setIsActionsSheetOpen] = useState(false)
  const [selectedJobForActions, setSelectedJobForActions] = useState<JobOpening | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleViewJob = (job: JobOpening) => {
    setSelectedJob(job)
    setIsViewDialogOpen(true)
  }

  const handleEditJob = (job: JobOpening) => {
    setSelectedJob(job)
    setIsEditDialogOpen(true)
  }

  const handleOpenActions = (job: JobOpening) => {
    setSelectedJobForActions(job)
    setIsActionsSheetOpen(true)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No job openings yet. Create your first job opening to get started.
      </div>
    )
  }

  return (
    <>
      {isMobile ? (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onManageCandidates={setSelectedJobForCandidates}
              onOpenActions={handleOpenActions}
            />
          ))}
        </div>
      ) : (
        <JobTable
          jobs={jobs}
          onViewJob={handleViewJob}
          onEditJob={handleEditJob}
          onManageCandidates={setSelectedJobForCandidates}
          fetchJobs={fetchJobs}
        />
      )}

      <ViewJobDialog
        job={selectedJob}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />

      <EditJobDialog
        job={selectedJob}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onJobUpdated={fetchJobs}
      />

      <CandidatesModal
        jobId={selectedJobForCandidates?.id || ""}
        jobTitle={selectedJobForCandidates?.title || ""}
        open={!!selectedJobForCandidates}
        onOpenChange={(open) => !open && setSelectedJobForCandidates(null)}
      />

      <Sheet open={isActionsSheetOpen} onOpenChange={setIsActionsSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Manage Job</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            {selectedJobForActions && (
              <div className="space-y-2">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
                  onClick={() => {
                    handleViewJob(selectedJobForActions)
                    setIsActionsSheetOpen(false)
                  }}
                >
                  View Details
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-muted rounded-md"
                  onClick={() => {
                    handleEditJob(selectedJobForActions)
                    setIsActionsSheetOpen(false)
                  }}
                >
                  Edit Job
                </button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}