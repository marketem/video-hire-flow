import { useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js"
import { Database } from "@/integrations/supabase/types"

type CandidateRow = Database['public']['Tables']['candidates']['Row']

export function CandidateNotifications() {
  const supabase = useSupabaseClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    console.log('Setting up candidate notifications listener')
    
    const channel = supabase
      .channel('candidate-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'candidates',
          filter: `video_url=is.not.null
                  and video_submitted_at=is.not.null
                  and old_video_submitted_at=is.null`
        },
        async (payload: RealtimePostgresChangesPayload<CandidateRow>) => {
          const newRecord = (payload as any).new_record as CandidateRow
          console.log('Video submission detected:', { newRecord })

          try {
            console.log('Sending video submission notification email')
            const response = await fetch('/api/send-video-notification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                candidateId: newRecord.id,
                candidateName: newRecord.name,
                candidateEmail: newRecord.email,
                jobId: newRecord.job_id,
                status: 'submitted' // Adding status to indicate this is a video submission notification
              }),
            })

            if (!response.ok) {
              throw new Error('Failed to send notification')
            }

            console.log('Notification email sent successfully')
            toast({
              title: "Video Submission Received",
              description: `New video received from ${newRecord.name}`,
            })
          } catch (error) {
            console.error('Error sending notification:', error)
            toast({
              title: "Notification Error",
              description: "Failed to send video submission notification",
              variant: "destructive",
            })
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up candidate notifications listener')
      supabase.removeChannel(channel)
    }
  }, [supabase, toast])

  // This component doesn't render anything
  return null
}