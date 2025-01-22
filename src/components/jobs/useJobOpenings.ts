import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useState, useCallback, useEffect, useRef } from "react"
import type { JobOpening } from "./types"
import { RealtimeChannel, RealtimeChannelStatus } from "@supabase/supabase-js"

export function useJobOpenings() {
  const [jobs, setJobs] = useState<JobOpening[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const toastTimeoutRef = useRef<NodeJS.Timeout>()
  const channelRef = useRef<RealtimeChannel>()

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

    // Clear any existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('job-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_openings'
        },
        async (payload) => {
          console.log('Real-time update received:', payload)
          await fetchJobs()
        }
      )

    channelRef.current = channel

    // Subscribe to the channel
    channel.subscribe((status: RealtimeChannelStatus) => {
      console.log('Subscription status:', status)
      
      // Clear any existing toast timeout
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }

      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to real-time updates')
      } else {
        // Set a timeout to show the toast only if the connection isn't established quickly
        toastTimeoutRef.current = setTimeout(() => {
          if (status !== 'SUBSCRIBED') {
            console.warn('Subscription status not optimal:', status)
            toast({
              title: "Real-time Updates Status",
              description: "Attempting to establish real-time connection...",
              variant: "default",
            })
          }
        }, 2000) // Wait 2 seconds before showing the toast
      }
    })

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription...')
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [fetchJobs, supabase, toast])

  return {
    jobs,
    isLoading,
    fetchJobs
  }
}