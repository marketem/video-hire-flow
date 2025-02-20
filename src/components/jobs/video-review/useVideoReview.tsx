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

      console.log('Raw candidates data:', data)
      console.log('Candidates with videos:', data.filter(c => c.video_url))
      console.log('Candidates with video_submitted_at:', data.filter(c => c.video_submitted_at))
      console.log('Candidates by status:', data.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1
        return acc
      }, {} as Record<string, number>))

      // Update any candidates that have videos but are still in 'requested' or 'new' status
      const candidatesToUpdate = data.filter(
        c => c.video_url && ['new', 'requested'].includes(c.status)
      )

      console.log('Candidates needing status update:', candidatesToUpdate)

      if (candidatesToUpdate.length > 0) {
        const { error: updateError } = await supabase
          .from('candidates')
          .update({ status: 'reviewing' })
          .in('id', candidatesToUpdate.map(c => c.id))

        if (updateError) {
          console.error('Error updating candidate statuses:', updateError)
        } else {
          console.log('Updated candidates status to reviewing:', candidatesToUpdate.map(c => c.id))
          // Update local data to reflect the changes
          data.forEach(c => {
            if (c.video_url && ['new', 'requested'].includes(c.status)) {
              c.status = 'reviewing'
            }
          })
        }
      }
      
      return data as Candidate[]
    },
    enabled: !!jobId,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const readyForReview = candidates.filter(c => {
    const isReady = c.video_url && ['new', 'reviewing'].includes(c.status)
    if (c.video_url) {
      console.log('Candidate video status check:', {
        id: c.id,
        name: c.name,
        hasVideo: !!c.video_url,
        status: c.status,
        isReady
      })
    }
    return isReady
  })

  const awaitingResponse = candidates.filter(c => 
    c.video_token && !c.video_url && c.status === 'requested'
  )

  const approvedCandidates = candidates.filter(c => 
    c.status === 'approved'
  )

  const rejectedCandidates = candidates.filter(c => 
    c.status === 'rejected'
  )

  console.log('Filtered candidates:', {
    readyForReview: readyForReview.length,
    awaitingResponse: awaitingResponse.length,
    approved: approvedCandidates.length,
    rejected: rejectedCandidates.length
  })

  const handleReviewAction = async (candidateId: string, status: 'reviewing' | 'rejected' | 'approved') => {
    try {
      console.log('Updating candidate status:', { candidateId, status })
      
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidateId)

      if (error) throw error

      console.log('Successfully updated candidate status')
      
      toast({
        title: "Success",
        description: `Candidate marked as ${status}`,
      })

      refetch()
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

      console.log('Successfully generated signed URL for video')
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