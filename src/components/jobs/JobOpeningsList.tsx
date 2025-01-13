import { useEffect, useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, Link as LinkIcon, Eye, Edit, XOctagon, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ViewJobDialog } from "./ViewJobDialog"
import { EditJobDialog } from "./EditJobDialog"
import { CandidatesModal } from "./CandidatesModal"

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  status: string
  created_at: string
  description: string
  candidates_count: number
}

export function JobOpeningsList() {
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedJobForCandidates, setSelectedJobForCandidates] = useState<JobOpening | null>(null)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const fetchJobs = async () => {
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      // Fetch candidates count for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count, error: countError } = await supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id)

          if (countError) throw countError

          return {
            ...job,
            candidates_count: count || 0
          }
        })
      )

      setJobs(jobsWithCounts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch job openings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const copyPublicLink = (jobId: string) => {
    const link = `${window.location.origin}/jobs/${jobId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: "Public job link copied to clipboard",
    })
  }

  const handleCloseJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('job_openings')
        .update({ status: 'closed' })
        .eq('id', jobId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Job has been closed",
      })
      
      fetchJobs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close job",
        variant: "destructive",
      })
    }
  }

  const handleReopenJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('job_openings')
        .update({ status: 'open' })
        .eq('id', jobId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Job has been reopened",
      })
      
      fetchJobs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reopen job",
        variant: "destructive",
      })
    }
  }

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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Candidates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-medium">{job.title}</TableCell>
              <TableCell>{job.location}</TableCell>
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
              <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyPublicLink(job.id)}
                  title="Copy public link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setSelectedJobForCandidates(job)}
                  title="Request video submissions"
                >
                  <Users className="h-4 w-4" />
                  Request Videos
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewJob(job)}
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditJob(job)}
                  title="Edit job"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {job.status === 'open' ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCloseJob(job.id)}
                    title="Close job"
                  >
                    <XOctagon className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleReopenJob(job.id)}
                    title="Reopen job"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
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
