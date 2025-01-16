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

      for (const job of jobs || []) {
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

        // Count videos received (candidates with video_url)
        const videosReceived = candidates.filter(c => c.video_url).length

        // Count candidates ready for review (have video but status is new or reviewing)
        const readyForReview = candidates.filter(c => 
          c.video_url && ['new', 'reviewing'].includes(c.status)
        ).length

        // Count candidates awaiting response (have token but no video yet)
        const awaitingResponse = candidates.filter(c => 
          c.video_token && !c.video_url && c.status === 'requested'
        ).length

        // Count approved candidates (status is approved)
        const approvedCount = candidates.filter(c => 
          c.status === 'approved'
        ).length

        // Count rejected candidates (status is rejected)
        const rejectedCount = candidates.filter(c => 
          c.status === 'rejected'
        ).length

        // Count total invites sent (candidates with video_token)
        const totalInvitesSent = candidates.filter(c => 
          c.video_token
        ).length

        // Get the oldest pending video for prioritization
        const pendingVideos = candidates.filter(c => 
          c.video_url && ['new', 'reviewing'].includes(c.status)
        )
        const oldestPending = pendingVideos.length > 0 
          ? parseISO(pendingVideos[0].created_at)
          : undefined

        // Only add jobs that have either received videos or have pending invites
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
    refetchInterval: 5000, // Refresh every 5 seconds
  })
}