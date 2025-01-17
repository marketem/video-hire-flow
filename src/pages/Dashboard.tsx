import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { JobOpenings } from "@/components/jobs/JobOpenings"
import { VideoReviewCards } from "@/components/jobs/video-review/VideoReviewCards"
import { useRealtimeCandidateStatus } from "@/hooks/useRealtimeCandidateStatus"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { Candidate } from "@/types/candidate"

export default function Dashboard() {
  const session = useSession()
  const navigate = useNavigate()
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  // Add the realtime status updates hook
  useRealtimeCandidateStatus()

  // Pre-fetch candidates for all jobs
  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data: jobs, error } = await supabase
        .from('job_openings')
        .select('*')
        .eq('user_id', session?.user?.id)
      
      if (error) throw error
      return jobs
    },
    enabled: !!session?.user?.id
  })

  // Pre-fetch candidates for all jobs
  useEffect(() => {
    if (jobs) {
      jobs.forEach(job => {
        // Pre-fetch candidates for each job
        queryClient.prefetchQuery({
          queryKey: ['job-candidates', job.id],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('candidates')
              .select('*')
              .eq('job_id', job.id)
              .order('created_at', { ascending: false })

            if (error) throw error
            return data as Candidate[]
          }
        })

        // Pre-fetch candidates for video review
        queryClient.prefetchQuery({
          queryKey: ['candidates-review', job.id],
          queryFn: async () => {
            const { data, error } = await supabase
              .from('candidates')
              .select('*')
              .eq('job_id', job.id)
              .order('created_at', { ascending: false })

            if (error) throw error
            return data as Candidate[]
          }
        })
      })
    }
  }, [jobs, queryClient, supabase])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the dashboard",
          variant: "destructive",
        })
        navigate("/login")
      }
    }

    checkSession()
  }, [navigate, supabase.auth, toast])

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <DashboardStats />
      <div className="space-y-8">
        <VideoReviewCards />
        <JobOpenings />
      </div>
    </div>
  )
}