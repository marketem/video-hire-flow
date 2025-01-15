import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoReviewModal } from "./VideoReviewModal"
import { useState } from "react"
import { Clock, AlertCircle, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface VideoStats {
  jobId: string
  jobTitle: string
  videosReceived: number
  readyForReview: number
  awaitingResponse: number
  oldestPending?: Date
  totalInvitesSent: number
}

export function VideoReviewCards() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const supabase = useSupabaseClient()

  const { data: videoStats = [] } = useQuery({
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
          c.status === 'requested' && !c.video_url
        ).length
        const totalInvitesSent = candidates.filter(c => 
          c.status === 'requested' || c.video_url
        ).length

        // Find oldest pending review
        const pendingVideos = candidates.filter(c => 
          c.video_url && ['new', 'reviewing'].includes(c.status)
        )
        const oldestPending = pendingVideos.length > 0 
          ? new Date(pendingVideos[0].created_at) 
          : undefined

        if (videosReceived > 0 || awaitingResponse > 0) {
          console.log('Adding job to stats:', {
            jobId: job.id,
            jobTitle: job.title,
            videosReceived,
            readyForReview,
            awaitingResponse,
            oldestPending,
            totalInvitesSent
          })

          stats.push({
            jobId: job.id,
            jobTitle: job.title,
            videosReceived,
            readyForReview,
            awaitingResponse,
            oldestPending,
            totalInvitesSent
          })
        }
      }

      return stats
    },
    refetchInterval: 5000,
  })

  const getPriorityIndicator = (stat: VideoStats) => {
    if (!stat.oldestPending) return null
    const waitingTime = formatDistanceToNow(stat.oldestPending)
    const isUrgent = new Date().getTime() - stat.oldestPending.getTime() > 24 * 60 * 60 * 1000 // 24 hours

    return (
      <div className={`flex items-center gap-1 text-xs ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`}>
        {isUrgent ? <AlertCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
        <span>Waiting {waitingTime}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Review Videos</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {videoStats.map((stat) => (
          <Card 
            key={stat.jobId}
            className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] border-primary/10 ${
              stat.readyForReview > 0 ? 'bg-gradient-to-br from-white to-red-50/30' : ''
            }`}
            onClick={() => setSelectedJobId(stat.jobId)}
          >
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-base truncate flex items-start justify-between gap-2">
                <span>{stat.jobTitle}</span>
                {stat.readyForReview > 0 && (
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                    {stat.readyForReview}
                  </span>
                )}
              </CardTitle>
              {stat.oldestPending && getPriorityIndicator(stat)}
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="text-sm text-muted-foreground">
                {stat.videosReceived}/{stat.totalInvitesSent} videos received
              </div>
              {stat.awaitingResponse > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{stat.awaitingResponse} {stat.awaitingResponse === 1 ? 'invite' : 'invites'} awaiting response</span>
                </div>
              )}
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