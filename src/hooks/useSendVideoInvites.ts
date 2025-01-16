import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import type { Candidate } from "@/types/candidate"

export function useSendVideoInvites(jobId: string) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()

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