import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoReviewModal } from "./VideoReviewModal"
import { useState } from "react"
import { Clock, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react"
import { formatDistanceToNow, differenceInDays, parseISO } from "date-fns"

interface VideoStats {
  jobId: string
  jobTitle: string
  videosReceived: number
  readyForReview: number
  awaitingResponse: number
  approvedCount: number
  rejectedCount: number
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
        const approvedCount = candidates.filter(c => c.status === 'approved').length
        const rejectedCount = candidates.filter(c => c.status === 'rejected').length
        const totalInvitesSent = candidates.filter(c => 
          c.status === 'requested' || c.video_url
        ).length

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

  const getPriorityIndicator = (stat: VideoStats) => {
    if (!stat.oldestPending) return null
    
    const now = new Date()
    const daysWaiting = differenceInDays(now, stat.oldestPending)
    
    if (daysWaiting < 1) return null

    const dayText = daysWaiting === 1 ? 'day' : 'days'
    
    return (
      <div className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Waiting {daysWaiting} {dayText}</span>
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
                {getPriorityIndicator(stat)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-2">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center min-w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full px-1.5">
                    {stat.readyForReview}
                  </div>
                  <span className="text-xs">Ready for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{stat.awaitingResponse} Not Responded</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{stat.approvedCount} Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{stat.rejectedCount} Rejected</span>
                </div>
              </div>
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