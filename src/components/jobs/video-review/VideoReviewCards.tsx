import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoReviewModal } from "./VideoReviewModal"
import { useState } from "react"

interface VideoStats {
  jobId: string
  jobTitle: string
  invitesSent: number
  videosReceived: number
  pendingReview: number
  approved: number
}

export function VideoReviewCards() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const supabase = useSupabaseClient()

  const { data: videoStats = [] } = useQuery({
    queryKey: ['video-stats'],
    queryFn: async () => {
      const { data: jobs, error: jobsError } = await supabase
        .from('job_openings')
        .select('id, title')
        .eq('status', 'open')

      if (jobsError) throw jobsError

      const stats: VideoStats[] = []

      for (const job of jobs) {
        const { count: invitesSent } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .not('video_token', 'is', null)

        const { count: videosReceived } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .not('video_url', 'is', null)

        const { count: pendingReview } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .not('video_url', 'is', null)
          .eq('status', 'new')

        const { count: approved } = await supabase
          .from('candidates')
          .select('*', { count: 'exact', head: true })
          .eq('job_id', job.id)
          .eq('status', 'accepted')

        if (invitesSent || videosReceived || pendingReview || approved) {
          stats.push({
            jobId: job.id,
            jobTitle: job.title,
            invitesSent: invitesSent || 0,
            videosReceived: videosReceived || 0,
            pendingReview: pendingReview || 0,
            approved: approved || 0,
          })
        }
      }

      return stats
    },
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
                  <dt>Invites Sent:</dt>
                  <dd>{stat.invitesSent}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Videos Received:</dt>
                  <dd>{stat.videosReceived}</dd>
                </div>
                <div className={`flex justify-between font-medium ${stat.pendingReview > 1 ? 'text-red-600' : ''}`}>
                  <dt>Pending Review:</dt>
                  <dd>{stat.pendingReview}</dd>
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