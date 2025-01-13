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
import { Users, Link as LinkIcon, Eye, Edit, XOctagon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  status: string
  created_at: string
  description: string
}

export function JobOpeningsList() {
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
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
      
      fetchJobs() // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to close job",
        variant: "destructive",
      })
    }
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => (
          <TableRow key={job.id}>
            <TableCell className="font-medium">{job.title}</TableCell>
            <TableCell>{job.department}</TableCell>
            <TableCell>{job.location}</TableCell>
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
                variant="ghost"
                size="icon"
                title="View candidates"
              >
                <Users className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="View details"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Edit job"
              >
                <Edit className="h-4 w-4" />
              </Button>
              {job.status === 'open' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCloseJob(job.id)}
                  title="Close job"
                >
                  <XOctagon className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}