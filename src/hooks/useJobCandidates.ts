import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import type { Candidate } from "@/types/candidate"

export function useJobCandidates(jobId: string) {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['job-candidates', jobId],
    queryFn: async () => {
      if (!jobId) return []
      
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
      return data as Candidate[]
    },
    enabled: !!jobId,
  })
}