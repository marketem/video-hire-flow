import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import type { Candidate } from "@/types/candidate"

export function useJobCandidates(jobId: string) {
  const supabase = useSupabaseClient()
  const session = useSession()

  const query = useQuery({
    queryKey: ['job-candidates', jobId],
    queryFn: async () => {
      if (!jobId) return []
      
      console.log('Fetching candidates for job:', jobId)
      console.log('User authenticated:', !!session?.user)
      console.log('User ID:', session?.user?.id)

      // First verify job ownership
      const { data: jobData, error: jobError } = await supabase
        .from('job_openings')
        .select('user_id')
        .eq('id', jobId)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
        throw jobError
      }

      console.log('Job belongs to user:', jobData?.user_id === session?.user?.id)

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching candidates:', error)
        throw error
      }
      
      console.log('Raw Supabase response:', { data, error })
      console.log('Fetched candidates:', data)
      return data as Candidate[]
    },
    enabled: !!jobId && !!session?.user?.id,
  })

  return {
    ...query,
    candidates: query.data || [],
    fetchCandidates: () => query.refetch()
  }
}