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
import { Users, Link as LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  status: string
  created_at: string
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
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ring-green-600/20 bg-green-50 text-green-700">
                {job.status}
              </span>
            </TableCell>
            <TableCell>{new Date(job.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyPublicLink(job.id)}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Users className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}