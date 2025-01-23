import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import type { Candidate } from "@/types/candidate"

export function useVideoReview(jobId: string | null) {
  const supabase = useSupabaseClient()
  const session = useSession()
  const navigate = useNavigate()
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

      // Only update status to reviewing if they have a video and are in requested status
      const candidatesToUpdate = data.filter(
        c => c.video_url && c.status === 'requested'
      )

      if (candidatesToUpdate.length > 0) {
        console.log('Updating candidates to reviewing status:', candidatesToUpdate)
        
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'reviewing' })
          .in('id', candidatesToUpdate.map(c => c.id))

        if (updateError) {
          console.error('Error updating candidate statuses:', updateError)
        } else {
          data.forEach(c => {
            if (c.video_url && c.status === 'requested') {
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

  const handleReviewAction = async (candidateId: string, status: 'reviewing' | 'rejected' | 'approved') => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to review candidates",
        variant: "destructive",
      })
      navigate('/login')
      return
    }

    try {
      console.log('Updating candidate status:', { candidateId, status })
      
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidateId)
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: `Candidate marked as ${status}`,
      })

      await refetch()
    } catch (error) {
      console.error('Error updating candidate status:', error)
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive",
      })
    }
  }

  const getVideoUrl = async (videoPath: string, candidateName: string): Promise<string | null> => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view videos",
        variant: "destructive",
      })
      navigate('/login')
      return null
    }

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

  const readyForReview = candidates.filter(c => 
    c.video_url && c.status === 'reviewing'
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

  return {
    readyForReview,
    awaitingResponse,
    approvedCandidates,
    rejectedCandidates,
    handleReviewAction,
    getVideoUrl
  }
}