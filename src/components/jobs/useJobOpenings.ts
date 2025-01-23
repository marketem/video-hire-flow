import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import type { JobOpening } from "./types"

export function useJobOpenings() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const { toast } = useToast()

  const {
    data: jobs = [],
    isLoading,
    refetch: fetchJobs
  } = useQuery({
    queryKey: ['job-openings'],
    queryFn: async () => {
      try {
        console.log('Fetching jobs...')
        console.log('User authenticated:', !!session?.user)
        console.log('User ID:', session?.user?.id)

        if (!session?.user) {
          console.log('No authenticated user')
          return []
        }

        const { data: jobsData, error: jobsError } = await supabase
          .from('job_openings')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })

        if (jobsError) {
          console.error('Error fetching jobs:', jobsError)
          throw jobsError
        }

        console.log('Fetched jobs:', jobsData)

        // Fetch candidates count for each job
        const jobsWithCounts = await Promise.all(
          (jobsData || []).map(async (job) => {
            const { count, error: countError } = await supabase
              .from('candidates')
              .select('*', { count: 'exact', head: true })
              .eq('job_id', job.id)

            if (countError) {
              console.error('Error fetching candidates count:', countError)
              throw countError
            }

            return {
              ...job,
              candidates_count: count || 0
            }
          })
        )

        return jobsWithCounts
      } catch (error) {
        console.error('Error fetching jobs:', error)
        toast({
          title: "Error",
          description: "Failed to fetch job openings",
          variant: "destructive",
        })
        return []
      }
    },
    enabled: !!session?.user,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })

  return {
    jobs,
    isLoading,
    fetchJobs
  }
}