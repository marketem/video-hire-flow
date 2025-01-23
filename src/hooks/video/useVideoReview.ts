import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useQuery } from "@tanstack/react-query"
import type { Candidate } from "@/types/candidate"

export function useVideoReview(jobId: string | null) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const { data: candidates = [], refetch } = useQuery({
    queryKey: ['candidates-review', jobId],
    queryFn: async () => {
      if (!jobId) return []
      
      console.log('Fetching candidates for video review, job:', jobId)

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching candidates:', error)
        throw error
      }

      // If there are any candidates with videos but still in 'new' status,
      // update them to 'reviewing'
      const candidatesToUpdate = data.filter(
        c => c.video_url && c.status === 'new'
      )

      if (candidatesToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'reviewing' })
          .in('id', candidatesToUpdate.map(c => c.id))

        if (updateError) {
          console.error('Error updating candidate statuses:', updateError)
        } else {
          // Update local data to reflect the changes
          data.forEach(c => {
            if (c.video_url && c.status === 'new') {
              c.status = 'reviewing'
            }
          })
        }
      }
      
      return data as Candidate[]
    },
    enabled: !!jobId,
    refetchInterval: 5000,
  })

  const readyForReview = candidates.filter(c => 
    c.video_url && ['new', 'reviewing'].includes(c.status)
  )

  const awaitingResponse = candidates.filter(c => 
    c.video_token && !c.video_url && c.status === 'requested'
  )

  const approvedCandidates = candidates.filter(c => 
    c.status === 'approved'
  )

  const rejectedCandidates = candidates.filter(c => 
    c.status === 'rejected'
  )

  const handleReviewAction = async (candidateId: string, status: 'reviewing' | 'rejected' | 'approved') => {
    try {
      console.log('Updating candidate status:', { candidateId, status })
      
      const { data, error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidateId)
        .select()

      if (error) {
        console.error('Error updating candidate status:', error)
        throw error
      }

      console.log('Status update successful:', data)

      toast({
        title: "Success",
        description: `Candidate marked as ${status}`,
      })

      // Immediately refetch to update the UI
      await refetch()
    } catch (error) {
      console.error('Error in handleReviewAction:', error)
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive",
      })
    }
  }

  const getVideoUrl = async (videoPath: string, candidateName: string): Promise<string | null> => {
    try {
      console.log('Getting signed URL for video:', videoPath)
      const { data, error } = await supabase
        .storage
        .from('videos')
        .createSignedUrl(videoPath, 3600)

      if (error || !data?.signedUrl) {
        console.error('Error getting signed URL:', error)
        toast({
          title: "Error",
          description: "Could not access video. Please try again.",
          variant: "destructive",
        })
        return null
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error in getVideoUrl:', error)
      toast({
        title: "Error",
        description: "Failed to load video",
        variant: "destructive",
      })
      return null
    }
  }

  return {
    readyForReview,
    awaitingResponse,
    approvedCandidates,
    rejectedCandidates,
    handleReviewAction,
    getVideoUrl
  }
}