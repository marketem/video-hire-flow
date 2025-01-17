import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import type { JobOpening } from "../types"

export const useJobActionHandlers = (job: JobOpening, onJobsUpdated: () => void) => {
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const { copyToClipboard } = useCopyToClipboard()

  const handleDelete = async () => {
    const { error } = await supabase
      .from("job_openings")
      .delete()
      .eq("id", job.id)

    if (!error) {
      onJobsUpdated()
    }
  }

  const handleVisitPost = () => {
    const postUrl = `${window.location.origin}/jobs/${job.id}`
    window.open(postUrl, '_blank')
  }

  const handleCopyPost = async () => {
    const postUrl = `${window.location.origin}/jobs/${job.id}`
    const success = await copyToClipboard(postUrl)
    
    if (success) {
      toast({
        title: "Link copied",
        description: "Job post link has been copied to clipboard",
      })
    }
  }

  const handleCloseJob = async () => {
    console.log('Closing job:', job.id)
    const { error } = await supabase
      .from("job_openings")
      .update({ status: 'closed' })
      .eq("id", job.id)

    if (error) {
      console.error('Error closing job:', error)
      toast({
        title: "Error",
        description: "Failed to close job",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Job has been closed",
      })
      onJobsUpdated()
    }
  }

  return {
    handleDelete,
    handleVisitPost,
    handleCopyPost,
    handleCloseJob
  }
}