import { Button } from "@/components/ui/button"
import { Link as LinkIcon, Eye, Edit, XOctagon, RefreshCw, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { JobOpening } from "./types"

interface JobActionsProps {
  job: JobOpening
  onView: (job: JobOpening) => void
  onEdit: (job: JobOpening) => void
  onManageCandidates: (job: JobOpening) => void
  onJobsUpdated: () => void
  hideMobileManage?: boolean
}

export function JobActions({ 
  job, 
  onView, 
  onEdit, 
  onManageCandidates,
  onJobsUpdated,
  hideMobileManage = false
}: JobActionsProps) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const isMobile = useIsMobile()

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
      
      onJobsUpdated()
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
      
      onJobsUpdated()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reopen job",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-x-1">
      {(!isMobile || !hideMobileManage) && (
        <Button
          variant="secondary"
          onClick={() => onManageCandidates(job)}
          title="Manage candidates"
        >
          <Users className="mr-2 h-4 w-4" />
          Manage
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => copyPublicLink(job.id)}
        disabled={!job.public_page_enabled}
        title={job.public_page_enabled ? "Copy public link" : "Public page disabled"}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onView(job)}
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(job)}
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
    </div>
  )
}