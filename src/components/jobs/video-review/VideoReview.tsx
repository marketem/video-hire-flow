import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoSubmissionsList } from "./VideoSubmissionsList"
import { ReviewingList } from "./ReviewingList"
import { type Candidate } from "@/types/candidate"

export function VideoReview() {
  const [activeTab, setActiveTab] = useState("new")
  const supabase = useSupabaseClient()

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['video-submissions', activeTab],
    queryFn: async () => {
      const { data: openJobs } = await supabase
        .from('job_openings')
        .select('id')
        .eq('status', 'open')

      if (!openJobs?.length) return []

      const { data, error } = await supabase
        .from('candidates')
        .select('*, job_openings(title)')
        .in('job_id', openJobs.map(job => job.id))
        .not('video_url', 'is', null)
        .eq('status', activeTab === 'new' ? 'new' : 'reviewing')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Candidate & { job_openings: { title: string } })[]
    },
  })

  if (isLoading) {
    return <div>Loading video submissions...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Video Reviews</h2>
        <p className="text-muted-foreground">
          Review candidate video submissions and take action
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="new">New Submissions</TabsTrigger>
          <TabsTrigger value="reviewing">Under Review</TabsTrigger>
        </TabsList>
        <TabsContent value="new">
          <VideoSubmissionsList submissions={candidates || []} />
        </TabsContent>
        <TabsContent value="reviewing">
          <ReviewingList candidates={candidates || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}