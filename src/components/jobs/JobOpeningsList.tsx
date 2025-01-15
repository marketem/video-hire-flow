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

export function JobOpeningsList() {
  const { jobs, isLoading, fetchJobs } = useJobOpenings()
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState<JobOpening | null>(null)
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
        <div className="space-y-4">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-card p-4 rounded-lg border space-y-3"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{job.title}</h3>
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
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>📍 {job.location}</p>
                <p>📅 {new Date(job.created_at).toLocaleDateString()}</p>
                <p>👥 {job.candidates_count} candidates</p>
              </div>

              <div className="flex justify-end">
                <JobActions
                  job={job}
                  onView={handleViewJob}
                  onEdit={handleEditJob}
                  onManageCandidates={setSelectedJobForCandidates}
                  onJobsUpdated={fetchJobs}
                />
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
              <TableCell className="text-right">
                <JobActions
                  job={job}
                  onView={handleViewJob}
                  onEdit={handleEditJob}
                  onManageCandidates={setSelectedJobForCandidates}
                  onJobsUpdated={fetchJobs}
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