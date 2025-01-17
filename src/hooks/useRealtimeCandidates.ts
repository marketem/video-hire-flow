import { useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Database } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

export function useRealtimeCandidates(jobId: string, onUpdate: () => void) {
  const supabase = useSupabaseClient<Database>()
  const { toast } = useToast()

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
          
          // Show toast notification for video submissions
          if (
            payload.eventType === 'UPDATE' && 
            (payload as any).new_record?.video_url && 
            !(payload as any).old_record?.video_url
          ) {
            toast({
              title: "New Video Submission",
              description: `${(payload as any).new_record.name} has submitted their video interview.`,
            })
          }
          
          onUpdate()
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up realtime candidates listener')
      supabase.removeChannel(channel)
    }
  }, [jobId, onUpdate, supabase, toast])
}