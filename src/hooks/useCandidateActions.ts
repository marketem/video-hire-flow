import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

export function useCandidateActions() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { copyToClipboard } = useCopyToClipboard()

  const generateTokenMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const token = crypto.randomUUID()
      
      const { error } = await supabase
        .from('candidates')
        .update({ video_token: token })
        .eq('id', candidateId)

      if (error) throw error
      return { candidateId, token }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] })
    },
  })

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
      // First, fetch the current candidate data
      const { data: candidate } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single()

      if (!candidate) {
        throw new Error('Candidate not found')
      }

      // Generate token if it doesn't exist
      let token = candidate.video_token
      if (!token) {
        const result = await generateTokenMutation.mutateAsync(candidateId)
        token = result.token
      }

      const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${token}`
      const copySuccess = await copyToClipboard(videoSubmissionUrl)
      
      if (!copySuccess) {
        throw new Error(`Failed to copy: ${videoSubmissionUrl}`)
      }
      
      toast({
        title: "Success",
        description: "Video submission link copied to clipboard",
      })
      
      return true
    } catch (error) {
      console.error('Error in copyVideoLink:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate or copy video submission link",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    handleViewResume,
    copyVideoLink,
    generateTokenMutation,
  }
}