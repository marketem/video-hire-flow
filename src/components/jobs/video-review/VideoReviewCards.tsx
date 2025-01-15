import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
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
          <div 
            key={stat.jobId}
            className="bg-muted/30 rounded-lg p-2 md:p-4"
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-medium text-muted-foreground truncate pr-2">
                  {stat.jobTitle}
                </h3>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Ready for Review</span>
                    <span className="flex items-center justify-center min-w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full px-1.5">
                      {stat.readyForReview}
                    </span>
                  </div>
                  {getPriorityIndicator(stat)}
                </div>
              </div>
              <div className="space-y-1.5">
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
            </div>
          </div>
        ))}
        {videoStats.length === 0 && (
          <div className="col-span-3 text-center py-3 text-sm text-muted-foreground">
            No video submissions or pending requests yet
          </div>
        )}
      </div>
    </div>
  )
}