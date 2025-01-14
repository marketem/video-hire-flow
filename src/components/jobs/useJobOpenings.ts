import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useCallback } from "react"
import type { JobOpening } from "./types"

export function useJobOpenings() {
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const fetchJobs = useCallback(async () => {
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      // Fetch candidates count for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count, error: countError } = await supabase
            .from('candidates')
            .select('*', { count: 'exact', head: true })
            .eq('job_id', job.id)

          if (countError) throw countError

          return {
            ...job,
            candidates_count: count || 0
          }
        })
      )

      setJobs(jobsWithCounts)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch job openings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  return {
    jobs,
    isLoading,
    fetchJobs
  }
}