import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useCallback, useEffect } from "react"
import type { JobOpening } from "./types"
import { RealtimeChannel } from "@supabase/supabase-js"

export function useJobOpenings() {
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('Fetching jobs...')
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_openings')
        .select('*')
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

      setJobs(jobsWithCounts)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: "Error",
        description: "Failed to fetch job openings",
        variant: "destructive",
      })
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    console.log('Setting up initial fetch and real-time subscription...')
    fetchJobs()

    // Set up real-time subscription with improved error handling
    const channel = supabase
      .channel('job-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'job_openings'
        },
        async (payload) => {
          console.log('Real-time update received:', payload)
          
          // Refresh the entire list to ensure consistency
          // This also ensures we get fresh candidate counts
          await fetchJobs()
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates')
        } else {
          console.error('Failed to subscribe to real-time updates:', status)
          toast({
            title: "Real-time Updates Error",
            description: "Failed to subscribe to job updates. Some changes might not appear immediately.",
            variant: "destructive",
          })
        }
      })

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription...')
      channel.unsubscribe()
    }
  }, [fetchJobs, supabase, toast])

  return {
    jobs,
    isLoading,
    fetchJobs
  }
}