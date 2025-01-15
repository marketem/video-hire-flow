import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { parseISO } from "date-fns"
import type { VideoStats } from "./types"

export function useVideoStats() {
  const supabase = useSupabaseClient()

  return useQuery({
    queryKey: ['video-stats'],
    queryFn: async () => {
      console.log('Fetching video stats...')
      
      const { data: jobs, error: jobsError } = await supabase
        .from('job_openings')
        .select('id, title')
        .eq('status', 'open')

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError)
        throw jobsError
      }

      console.log('Fetched jobs:', jobs)

      const stats: VideoStats[] = []

      for (const job of jobs) {
        const { data: candidates, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: true })

        if (candidatesError) {
          console.error('Error fetching candidates for job', job.id, candidatesError)
          continue
        }

        if (!candidates?.length) continue

        const videosReceived = candidates.filter(c => c.video_url).length
        const readyForReview = candidates.filter(c => 
          c.video_url && ['new', 'reviewing'].includes(c.status)
        ).length
        const awaitingResponse = candidates.filter(c => 
          c.video_token && !c.video_url
        ).length
        const approvedCount = candidates.filter(c => c.status === 'approved').length
        const rejectedCount = candidates.filter(c => c.status === 'rejected').length
        const totalInvitesSent = candidates.filter(c => c.video_token).length

        const pendingVideos = candidates.filter(c => 
          c.video_url && ['new', 'reviewing'].includes(c.status)
        )
        const oldestPending = pendingVideos.length > 0 
          ? parseISO(pendingVideos[0].created_at)
          : undefined

        if (videosReceived > 0 || awaitingResponse > 0) {
          stats.push({
            jobId: job.id,
            jobTitle: job.title,
            videosReceived,
            readyForReview,
            awaitingResponse,
            approvedCount,
            rejectedCount,
            oldestPending,
            totalInvitesSent
          })
        }
      }

      return stats
    },
    refetchInterval: 5000,
  })
}