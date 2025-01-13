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
        
        // Send email using Supabase Edge Function
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-video-invite', {
          body: {
            to: candidate.email,
            name: candidate.name,
            companyName: user?.user_metadata?.company_name || 'our company',
            senderName: user?.user_metadata?.name || 'The hiring manager',
            submissionUrl: videoSubmissionUrl
          }
        })

        if (emailError) {
          console.error('Error sending email:', emailError)
          throw new Error('Failed to send email invitation')
        }

        console.log('Email sent successfully:', emailData)

        // Update candidate status
        await supabase
          .from('candidates')
          .update({ status: 'requested' })
          .eq('id', candidate.id)
      }

      await queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })

      toast({
        title: "Success",
        description: `Video invites sent to ${selectedCandidatesList.length} candidates`,
      })

      return true
    } catch (error) {
      console.error('Error sending invites:', error)
      toast({
        title: "Error",
        description: "Failed to send video invitations",
        variant: "destructive",
      })
      return false
    }
  }

  return { sendVideoInvites }
}