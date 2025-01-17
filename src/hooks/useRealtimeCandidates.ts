import { useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Database } from "@/integrations/supabase/types"

export function useRealtimeCandidates(jobId: string, onUpdate: () => void) {
  const supabase = useSupabaseClient<Database>()

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
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up realtime candidates listener')
      supabase.removeChannel(channel)
    }
  }, [jobId, onUpdate, supabase])
}