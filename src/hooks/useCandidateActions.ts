import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export function useCandidateActions(jobId: string) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { copyToClipboard } = useCopyToClipboard()

  const handleViewResume = async (resumeUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumeUrl, 60)

      if (error) throw error
      
      if (!data?.signedUrl) {
        throw new Error('Failed to generate signed URL')
      }

      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Error accessing resume:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access resume",
        variant: "destructive",
      })
    }
  }

  const copyVideoLink = async (candidateId: string) => {
    try {
      // Update status to 'requested' when copying link
      const { error: updateError } = await supabase
        .from('candidates')
        .update({ status: 'requested' })
        .eq('id', candidateId)

      if (updateError) throw updateError

      // Fetch the candidate's current token
      const { data: candidate, error: fetchError } = await supabase
        .from('candidates')
        .select('video_token')
        .eq('id', candidateId)
        .single()

      if (fetchError) throw fetchError
      if (!candidate?.video_token) throw new Error('No video token found')

      const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${candidate.video_token}`
      const copySuccess = await copyToClipboard(videoSubmissionUrl)
      
      if (!copySuccess) {
        throw new Error(`Failed to copy: ${videoSubmissionUrl}`)
      }
      
      toast({
        title: "Success",
        description: "Video submission link copied to clipboard",
      })

      // Refresh the candidates list
      queryClient.invalidateQueries({ queryKey: ['job-candidates', jobId] })
      queryClient.invalidateQueries({ queryKey: ['candidates-review', jobId] })
      
      return true
    } catch (error) {
      console.error('Error in copyVideoLink:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to copy video submission link",
        variant: "destructive",
      })
      return false
    }
  }

  const handleDelete = async (candidateIds: string[]) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', candidateIds)
        .eq('job_id', jobId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Successfully deleted ${candidateIds.length} candidate${candidateIds.length === 1 ? '' : 's'}`,
      })

      queryClient.invalidateQueries({ queryKey: ['job-candidates', jobId] })
      queryClient.invalidateQueries({ queryKey: ['candidates-review', jobId] })
    } catch (error) {
      console.error('Error deleting candidates:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete candidates",
        variant: "destructive",
      })
    }
  }

  return {
    handleViewResume,
    copyVideoLink,
    handleDelete,
  }
}