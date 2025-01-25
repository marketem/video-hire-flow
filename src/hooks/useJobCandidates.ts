import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { Candidate } from "@/types/candidate"

export function useJobCandidates(jobId: string) {
  const supabase = useSupabaseClient()

  const { data: candidates = [], isLoading, refetch } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      console.log('Fetching candidates for job:', jobId)
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching candidates:', error)
        throw error
      }

      console.log('Fetched candidates:', data)
      console.log('Candidates with videos:', data.filter(c => c.video_url))
      console.log('Candidates by status:', data.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1
        return acc
      }, {} as Record<string, number>))

      // Update any candidates that have videos but are still in 'requested' or 'new' status
      const candidatesToUpdate = data.filter(
        c => c.video_url && ['new', 'requested'].includes(c.status)
      )

      if (candidatesToUpdate.length > 0) {
        console.log('Candidates needing status update:', candidatesToUpdate)
        
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'reviewing' })
          .in('id', candidatesToUpdate.map(c => c.id))

        if (updateError) {
          console.error('Error updating candidate statuses:', updateError)
        } else {
          console.log('Updated candidates status to reviewing:', candidatesToUpdate.map(c => c.id))
          // Update local data to reflect the changes
          data.forEach(c => {
            if (c.video_url && ['new', 'requested'].includes(c.status)) {
              c.status = 'reviewing'
            }
          })
        }
      }

      return data as Candidate[]
    },
    refetchInterval: 5000 // Poll every 5 seconds
  })

  return {
    candidates,
    isLoading,
    fetchCandidates: refetch
  }
}