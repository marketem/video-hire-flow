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
      console.log('Starting sendVideoInvites function')
      console.log('Selected candidates:', selectedCandidates)
      console.log('All candidates:', candidates)
      console.log('Current user:', user)

      // First get the job title
      const { data: jobData } = await supabase
        .from('job_openings')
        .select('title')
        .eq('id', jobId)
        .single()

      const jobTitle = jobData?.title || 'the position'

      const selectedCandidatesList = candidates.filter(c => 
        selectedCandidates.includes(c.id)
      )

      console.log('Filtered candidates list:', selectedCandidatesList)

      for (const candidate of selectedCandidatesList) {
        console.log('Processing candidate:', candidate)
        
        // Generate a unique video token
        const videoToken = crypto.randomUUID()
        
        // Update the candidate with the video token
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ video_token: videoToken })
          .eq('id', candidate.id)
          .select()

        if (updateError) {
          console.error('Error updating video token:', updateError)
          throw new Error('Failed to generate video token')
        }

        const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${videoToken}`
        console.log('Generated submission URL:', videoSubmissionUrl)

        // Send the OTP email with template variables in the data field
        const { error: emailError } = await supabase.auth.signInWithOtp({
          email: candidate.email,
          options: {
            emailRedirectTo: videoSubmissionUrl,
            data: {
              type: 'video_invitation',
              name: candidate.name,
              companyName: user?.user_metadata?.company_name || 'our company',
              senderName: user?.user_metadata?.name || 'The hiring team',
              submissionUrl: videoSubmissionUrl
            }
          }
        })

        if (emailError) {
          console.error('Error sending invite:', emailError)
          
          // Check if it's a rate limit error
          if (emailError.message?.includes('can only request this after')) {
            const waitSeconds = emailError.message.match(/\d+/)?.[0] || '60'
            toast({
              title: "Please wait",
              description: `For security reasons, please wait ${waitSeconds} seconds before sending another invitation.`,
              variant: "destructive",
            })
            return false
          }
          
          throw new Error('Failed to send email invitation')
        }

        console.log('Successfully sent invite to:', candidate.email)

        // Update candidate status
        const { error: statusError } = await supabase
          .from('candidates')
          .update({ status: 'requested' })
          .eq('id', candidate.id)

        if (statusError) {
          console.error('Error updating candidate status:', statusError)
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