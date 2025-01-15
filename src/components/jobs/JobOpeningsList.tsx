import { useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ViewJobDialog } from "./ViewJobDialog"
import { EditJobDialog } from "./EditJobDialog"
import { CandidatesModal } from "./CandidatesModal"
import { JobActions } from "./JobActions"
import { useJobOpenings } from "./useJobOpenings"
import type { JobOpening } from "./types"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Calendar, ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function JobOpeningsList() {
  const { jobs, isLoading, fetchJobs } = useJobOpenings()
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

  if (isMobile) {
    return (
      <>
        <div className="space-y-3">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-card p-3 rounded-lg border"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{job.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1 shrink-0">
                        <MapPin className="h-4 w-4 stroke-[1.5]" />
                        <span className="truncate">{job.location}</span>
                      </p>
                      <p className="flex items-center gap-1 shrink-0">
                        <Users className="h-4 w-4 stroke-[1.5]" />
                        <span>{job.candidates_count} candidates</span>
                      </p>
                      <p className="flex items-center gap-1 shrink-0">
                        <Calendar className="h-4 w-4 stroke-[1.5]" />
                        <span>{new Date(job.created_at).toLocaleDateString()}</span>
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
                    onClick={() => setSelectedJobForCandidates(job)}
                  >
                    Invites
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-white"
                    onClick={() => handleOpenActions(job)}
                  >
                    Manage
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
                <JobActions
                  job={selectedJobForActions}
                  onView={handleViewJob}
                  onEdit={handleEditJob}
                  onManageCandidates={setSelectedJobForCandidates}
                  onJobsUpdated={fetchJobs}
                  orientation="vertical"
                />
              )}
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.location}</TableCell>
              <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{job.candidates_count}</TableCell>
              <TableCell>
                <span 
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    job.status === 'open' 
                      ? 'ring-green-600/20 bg-green-50 text-green-700'
                      : 'ring-red-600/20 bg-red-50 text-red-700'
                  }`}
                >
                  {job.status}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setSelectedJobForCandidates(job)}
                >
                  Invites
                </Button>
                <JobActions
                  job={job}
                  onView={handleViewJob}
                  onEdit={handleEditJob}
                  onManageCandidates={setSelectedJobForCandidates}
                  onJobsUpdated={fetchJobs}
                  hideMobileManage
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </>
  )
}