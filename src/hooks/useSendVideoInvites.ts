import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import type { Candidate } from "@/types/candidate"

export function useSendVideoInvites(jobId: string) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`
  }

  const sendVideoInvites = async (selectedCandidates: string[], candidates: Candidate[]) => {
    try {
      console.log('Starting sendVideoInvites function')
      console.log('Selected candidates:', selectedCandidates)
      console.log('All candidates:', candidates)
      console.log('Current user:', user)

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
        if (!candidate.video_token) {
          console.error('No video token found for candidate:', candidate.id)
          continue
        }

        const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${candidate.video_token}`
        console.log('Generated submission URL:', videoSubmissionUrl)

        const promises = []

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

        if (candidate.phone) {
          const formattedPhone = formatPhoneNumber(candidate.phone)
          console.log('Sending SMS to formatted phone:', formattedPhone)
          
          promises.push(
            supabase.functions.invoke('send-sms-invite', {
              body: {
                name: candidate.name,
                phone: formattedPhone,
                companyName: user?.user_metadata?.company_name || 'our company',
                senderName: user?.user_metadata?.name || 'The hiring team',
                submissionUrl: videoSubmissionUrl
              }
            })
          )
        }

        const results = await Promise.allSettled(promises)
        const errors = results
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map(result => result.reason)
        
        if (errors.length > 0) {
          console.error('Errors sending invites:', errors)
          throw new Error('Failed to send some invitations')
        }

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