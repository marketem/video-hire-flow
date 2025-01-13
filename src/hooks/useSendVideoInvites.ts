import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import type { Candidate } from "@/types/candidate"

export function useSendVideoInvites(jobId: string) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const sendVideoInvites = async (selectedCandidates: string[], candidates: Candidate[]) => {
    try {
      const selectedCandidatesList = candidates.filter(c => 
        selectedCandidates.includes(c.id)
      )

      for (const candidate of selectedCandidatesList) {
        const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${candidate.video_token}`
        
        console.log('Sending invite to:', candidate.email, 'with URL:', videoSubmissionUrl)
        
        // Use the auth.resetPasswordForEmail which uses the "invite" template
        const { error: emailError } = await supabase.auth.resetPasswordForEmail(
          candidate.email,
          {
            redirectTo: videoSubmissionUrl,
            data: {
              type: 'video_invite',
              name: candidate.name,
              companyName: user?.user_metadata?.company_name || 'our company',
              senderName: user?.user_metadata?.name || 'The hiring manager',
              submissionUrl: videoSubmissionUrl
            }
          }
        )

        if (emailError) {
          console.error('Error sending invite:', emailError)
          throw new Error('Failed to send email invitation')
        }

        console.log('Successfully sent invite to:', candidate.email)

        // Update candidate status
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'requested' })
          .eq('id', candidate.id)

        if (updateError) {
          console.error('Error updating candidate status:', updateError)
          throw new Error('Failed to update candidate status')
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['job-candidates', jobId] })

      toast({
        title: "Success",
        description: `Video invites sent to ${selectedCandidatesList.length} candidates`,
      })

      return true
    } catch (error) {
      console.error('Error sending invites:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send video invitations",
        variant: "destructive",
      })
      return false
    }
  }

  return { sendVideoInvites }
}