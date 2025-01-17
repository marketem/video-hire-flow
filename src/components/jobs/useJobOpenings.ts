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

  // Subscribe to real-time changes
  useEffect(() => {
    console.log('Setting up real-time subscription for jobs...')
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_openings'
        },
        (payload) => {
          console.log('Received real-time update:', payload)
          
          // Handle different event types
          switch (payload.eventType) {
            case 'INSERT':
              setJobs(currentJobs => {
                const newJob: JobOpening = {
                  id: payload.new.id,
                  title: payload.new.title,
                  department: payload.new.department,
                  location: payload.new.location,
                  status: payload.new.status,
                  created_at: payload.new.created_at,
                  description: payload.new.description,
                  public_page_enabled: payload.new.public_page_enabled,
                  candidates_count: 0 // New job has no candidates
                }
                return [newJob, ...currentJobs]
              })
              break
              
            case 'UPDATE':
              setJobs(currentJobs =>
                currentJobs.map(job =>
                  job.id === payload.new.id
                    ? { ...job, ...payload.new, candidates_count: job.candidates_count }
                    : job
                )
              )
              break
              
            case 'DELETE':
              setJobs(currentJobs =>
                currentJobs.filter(job => job.id !== payload.old.id)
              )
              break
          }
        }
      )
      .subscribe(async (status) => {
        console.log('Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          // Only fetch initial data after subscription is established
          await fetchJobs()
        }
      })

    return () => {
      console.log('Cleaning up real-time subscription')
      channel.unsubscribe()
    }
  }, [supabase, fetchJobs])

  return {
    jobs,
    isLoading,
    fetchJobs
  }
}