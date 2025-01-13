import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoReviewModal } from "./VideoReviewModal"
import { useState } from "react"

interface VideoStats {
  jobId: string
  jobTitle: string
  videosReceived: number
  readyForReview: number
  approved: number
}

export function VideoReviewCards() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const { data: videoStats = [] } = useQuery({
    queryKey: ['video-stats'],
    queryFn: async () => {
      console.log('Fetching video stats...')
      const { data: jobs, error: jobsError } = await supabase
        .from('job_openings')
        .select('id, title')
        .eq('status', 'open')

      if (jobsError) throw jobsError

      const stats: VideoStats[] = []

      for (const job of jobs) {
        const { count: videosReceived } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .not('video_url', 'is', null)

        const { count: readyForReview } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .not('video_url', 'is', null)
          .in('status', ['new', 'reviewing'])

        const { count: approved } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .eq('status', 'accepted')

        if (videosReceived || readyForReview || approved) {
          stats.push({
            jobId: job.id,
            jobTitle: job.title,
            videosReceived: videosReceived || 0,
            readyForReview: readyForReview || 0,
            approved: approved || 0,
          })
        }
      }

      console.log('Video stats fetched:', stats)
      return stats
    },
    // Refresh every 5 seconds to catch new invites
    refetchInterval: 5000,
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Videos</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {videoStats.map((stat) => (
          <Card 
            key={stat.jobId}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setSelectedJobId(stat.jobId)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{stat.jobTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>Videos Received:</dt>
                  <dd>{stat.videosReceived}</dd>
                </div>
                <div className={`flex justify-between font-medium ${stat.readyForReview > 1 ? 'text-red-600' : ''}`}>
                  <dt>Ready for Review:</dt>
                  <dd>{stat.readyForReview}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Approved:</dt>
                  <dd>{stat.approved}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>

      <VideoReviewModal
        jobId={selectedJobId}
        open={!!selectedJobId}
        onOpenChange={(open) => !open && setSelectedJobId(null)}
      />
    </div>
  )
}