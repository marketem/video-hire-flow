import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import type { Candidate } from "@/types/candidate"
import { usePremiumAccess } from "@/hooks/usePremiumAccess"

export function useSendVideoInvites(jobId: string) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const hasPremiumAccess = usePremiumAccess()

  const sendVideoInvites = async (selectedIds: string[], candidates: Candidate[]) => {
    if (!jobId || selectedIds.length === 0) {
      toast({
        title: "Error",
        description: "No candidates selected",
        variant: "destructive",
      })
      return false
    }

    try {
      // NOTE: Daily request limit for trial users is currently disabled
      // To re-enable the 5-invite daily limit, uncomment the following code block:
      /*
      if (!hasPremiumAccess) {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's request count
        const { data: logData, error: logError } = await supabase
          .from('video_request_logs')
          .select('request_count')
          .eq('request_date', today)
          .single()

        if (logError && logError.code !== 'PGRST116') {
          console.error('Error checking request limit:', logError)
          throw new Error('Failed to check request limit')
        }

        const currentCount = logData?.request_count || 0
        const newCount = currentCount + selectedIds.length

        if (newCount > 5) {
          toast({
            title: "Daily Limit Exceeded",
            description: "Free trial users can only send 5 video requests per day. Upgrade to premium for unlimited requests.",
            variant: "destructive",
          })
          return false
        }

        // Update or insert request log
        const { error: upsertError } = await supabase
          .from('video_request_logs')
          .upsert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            request_date: today,
            request_count: newCount
          }, {
            onConflict: 'user_id, request_date'
          })

        if (upsertError) {
          console.error('Error updating request log:', upsertError)
          throw new Error('Failed to update request log')
        }
      }
      */

      console.log('Starting to send video invites for candidates:', selectedIds)
      const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id))
      
      for (const candidate of selectedCandidates) {
        console.log('Processing candidate:', candidate.id)
        
        // First get the latest candidate data to ensure we have the video token
        const { data: updatedCandidate, error: fetchError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', candidate.id)
          .single()

        if (fetchError) {
          console.error('Error fetching candidate data:', fetchError)
          continue
        }

        console.log('Updated candidate data:', updatedCandidate)

        if (!updatedCandidate.video_token) {
          console.error('No video token found for candidate:', candidate.id)
          continue
        }

        // Call the edge function directly
        console.log('Calling send-video-invite edge function...')
        const { data: response, error: functionError } = await supabase.functions.invoke(
          'send-video-invite',
          {
            body: {
              candidate_id: candidate.id,
              video_token: updatedCandidate.video_token,
              candidate_name: candidate.name,
              candidate_email: candidate.email,
              candidate_phone: candidate.phone
            }
          }
        )

        console.log('Edge function response:', response)
        
        if (functionError) {
          console.error('Error calling edge function:', functionError)
          toast({
            title: "Error",
            description: `Failed to send invite to ${candidate.name}`,
            variant: "destructive",
          })
          continue
        }

        // Update candidate status to 'requested'
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'requested' })
          .eq('id', candidate.id)

        if (updateError) {
          console.error('Error updating candidate status:', updateError)
        }
      }

      toast({
        title: "Success",
        description: `Sent ${selectedIds.length} video invites`,
      })
      return true
    } catch (error) {
      console.error('Error in sendVideoInvites:', error)
      toast({
        title: "Error",
        description: "Failed to send video invites",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    sendVideoInvites
  }
}