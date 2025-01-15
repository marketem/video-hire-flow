import { useQuery } from "@tanstack/react-query"
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

  const { data: videoStats = [] } = useQuery({
    queryKey: ['video-stats'],
    queryFn: async () => {
      console.log('Fetching video stats...')
      
      // First, get all open jobs
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

      // Then, for each job, get its candidates
      for (const job of jobs) {
        const { data: candidates, error: candidatesError } = await supabase
          .from('candidates')
          .select('*')
          .eq('job_id', job.id)

        if (candidatesError) {
          console.error('Error fetching candidates for job', job.id, candidatesError)
          continue
        }

        if (!candidates?.length) continue

        const videosReceived = candidates.filter(c => c.video_url).length
        const readyForReview = candidates.filter(c => 
          c.video_url && ['new', 'reviewing'].includes(c.status)
        ).length
        const approved = candidates.filter(c => c.status === 'accepted').length
        const hasRequestedVideos = candidates.some(c => c.status === 'requested')

        // Include job if it has any videos or requested videos
        if (videosReceived > 0 || hasRequestedVideos) {
          console.log('Adding job to stats:', {
            jobId: job.id,
            jobTitle: job.title,
            videosReceived,
            readyForReview,
            approved,
            hasRequestedVideos
          })

          stats.push({
            jobId: job.id,
            jobTitle: job.title,
            videosReceived,
            readyForReview,
            approved,
          })
        }
      }

      return stats
    },
    refetchInterval: 5000,
  })

  const totalReadyForReview = videoStats.reduce((sum, stat) => sum + stat.readyForReview, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Review Videos</h2>
        {totalReadyForReview > 0 ? (
          <div className="flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-red-500 rounded-full">
            {totalReadyForReview}
          </div>
        ) : (
          <div className="flex items-center justify-center w-6 h-6 text-sm font-medium text-gray-600 bg-gray-100 rounded-full">
            0
          </div>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {videoStats.map((stat) => (
          <Card 
            key={stat.jobId}
            className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] border-primary/10"
            onClick={() => setSelectedJobId(stat.jobId)}
          >
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-base truncate">{stat.jobTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between items-center">
                  <dt>Videos Received:</dt>
                  <dd>{stat.videosReceived}</dd>
                </div>
                {stat.readyForReview > 0 ? (
                  <div className="flex justify-between items-center px-2 py-1 -mx-2 bg-red-50 text-red-700 rounded-md font-medium">
                    <dt>Ready for Review:</dt>
                    <dd>{stat.readyForReview}</dd>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <dt>Ready for Review:</dt>
                    <dd>{stat.readyForReview}</dd>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <dt>Approved:</dt>
                  <dd>{stat.approved}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
        {videoStats.length === 0 && (
          <div className="col-span-3 text-center py-3 text-sm text-muted-foreground">
            No video submissions or pending requests yet
          </div>
        )}
      </div>

      <VideoReviewModal
        jobId={selectedJobId}
        open={!!selectedJobId}
        onOpenChange={(open) => !open && setSelectedJobId(null)}
      />
    </div>
  )
}