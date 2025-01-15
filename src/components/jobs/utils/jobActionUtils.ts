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

  return {
    handleDelete,
    handleVisitPost,
    handleCopyPost
  }
}