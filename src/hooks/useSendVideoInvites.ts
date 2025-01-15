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

        // Send both email and SMS invites
        const promises = []

        // Send email invite
        promises.push(
          supabase.functions.invoke('send-video-invite', {
            body: {
              name: candidate.name,
              email: candidate.email,
              companyName: user?.user_metadata?.company_name || 'our company',
              senderName: user?.user_metadata?.name || 'The hiring team',
              submissionUrl: videoSubmissionUrl
            }
          })
        )

        // Send SMS invite if phone number exists
        if (candidate.phone) {
          promises.push(
            supabase.functions.invoke('send-sms-invite', {
              body: {
                name: candidate.name,
                phone: candidate.phone,
                companyName: user?.user_metadata?.company_name || 'our company',
                senderName: user?.user_metadata?.name || 'The hiring team',
                submissionUrl: videoSubmissionUrl
              }
            })
          )
        }

        // Wait for both email and SMS to be sent
        const results = await Promise.allSettled(promises)
        
        // Check for errors
        const errors = results
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map(result => result.reason)
        
        if (errors.length > 0) {
          console.error('Errors sending invites:', errors)
          throw new Error('Failed to send some invitations')
        }

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