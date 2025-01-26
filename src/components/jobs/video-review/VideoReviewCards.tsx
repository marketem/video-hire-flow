import { useState } from "react"
import { Clock, ThumbsUp, ThumbsDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoReviewModal } from "./VideoReviewModal"
import { useVideoStats } from "./useVideoStats"
import { PriorityIndicator } from "./PriorityIndicator"
import { StatRow } from "./StatRow"
import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"

export function VideoReviewCards() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const supabase = useSupabaseClient()
  
  // Add polling query to fetch and update candidates statuses
  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates-status-check'],
    queryFn: async () => {
      console.log('Polling for candidate status updates...')
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .in('status', ['new', 'requested'])
        .not('video_url', 'is', null)

      if (error) {
        console.error('Error fetching candidates for status check:', error)
        throw error
      }

      // If we find any candidates with videos that aren't in reviewing status, update them
      if (data && data.length > 0) {
        console.log('Found candidates needing status update:', data)
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'reviewing' })
          .in('id', data.map(c => c.id))

        if (updateError) {
          console.error('Error updating candidate statuses:', updateError)
        } else {
          console.log('Updated candidates to reviewing status:', data.map(c => c.id))
        }
      }

      return data
    },
    refetchInterval: 5000
  })

  const { data: videoStats = [] } = useVideoStats()

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
                <PriorityIndicator oldestPending={stat.oldestPending} />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-2">
              <div className="flex flex-col gap-2">
                <StatRow
                  isCircle
                  count={stat.readyForReview}
                  label="Ready for Review"
                  circleColor={stat.readyForReview > 0 ? 'bg-red-500' : 'bg-gray-400'}
                />
                <StatRow
                  icon={Clock}
                  count={stat.awaitingResponse}
                  label="Not Responded"
                />
                <StatRow
                  icon={ThumbsUp}
                  count={stat.approvedCount}
                  label="Approved"
                />
                <StatRow
                  icon={ThumbsDown}
                  count={stat.rejectedCount}
                  label="Rejected"
                />
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