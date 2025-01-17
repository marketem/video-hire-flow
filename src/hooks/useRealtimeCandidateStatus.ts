import { useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import type { RealtimePostgresUpdatePayload } from "@supabase/supabase-js"
import type { Database } from "@/integrations/supabase/types"

type CandidateRow = Database['public']['Tables']['candidates']['Row']

export function useRealtimeCandidateStatus() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    console.log('Setting up realtime candidate status listener')
    
    const channel = supabase
      .channel('candidate-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates'
        },
        async (payload: RealtimePostgresUpdatePayload<CandidateRow>) => {
          console.log('Realtime candidate update received:', payload)
          
          // In Supabase's RealtimePostgresUpdatePayload, the properties are oldRecord and newRecord
          const oldRecord = payload.oldRecord
          const newRecord = payload.newRecord

          // Check if a video was just submitted
          if (newRecord.video_url && !oldRecord.video_url) {
            console.log('Video submission detected, updating status to reviewing')
            
            try {
              const { error } = await supabase
                .from('candidates')
                .update({ status: 'reviewing' })
                .eq('id', newRecord.id)

              if (error) {
                console.error('Error updating candidate status:', error)
                return
              }

              // Show notification
              toast({
                title: "New Video Submission",
                description: `${newRecord.name} has submitted their video interview.`,
              })

              // Refresh queries
              queryClient.invalidateQueries({ queryKey: ['job-candidates'] })
              queryClient.invalidateQueries({ queryKey: ['candidates-review'] })
            } catch (error) {
              console.error('Error handling video submission:', error)
            }
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up realtime candidate status listener')
      supabase.removeChannel(channel)
    }
  }, [supabase, queryClient, toast])
}