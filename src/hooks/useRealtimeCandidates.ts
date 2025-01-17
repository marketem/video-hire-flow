import { useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { Database } from "@/integrations/supabase/types"

export function useRealtimeCandidates(jobId: string) {
  const supabase = useSupabaseClient<Database>()
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log('Setting up realtime candidates listener for job:', jobId)
    
    const channel = supabase
      .channel('candidates-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Real-time candidate update received:', payload)
          // Invalidate both queries to ensure all components update
          queryClient.invalidateQueries({ queryKey: ['job-candidates', jobId] })
          queryClient.invalidateQueries({ queryKey: ['candidates-review', jobId] })
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up realtime candidates listener')
      supabase.removeChannel(channel)
    }
  }, [jobId, queryClient, supabase])
}