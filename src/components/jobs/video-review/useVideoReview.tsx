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

  const { data: candidates, refetch } = useQuery({
    queryKey: ['candidates-review', jobId],
    queryFn: async () => {
      if (!jobId) return null
      
      console.log('Fetching candidates for job:', jobId)
      console.log('User authenticated:', !!session?.user)
      console.log('User ID:', session?.user?.id)

      // First verify job ownership
      const { data: jobData, error: jobError } = await supabase
        .from('job_openings')
        .select('user_id, title')
        .eq('id', jobId)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
        throw jobError
      }

      console.log('Job belongs to user:', jobData?.user_id === session?.user?.id)

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching candidates:', error)
        throw error
      }
      
      console.log('Raw Supabase response:', { data, error })
      console.log('Fetched candidates:', data)

      // Update status to 'reviewing' for candidates with videos but not in reviewing status
      const candidatesToUpdate = data.filter(
        (c: Candidate) => c.video_url && c.status !== 'reviewing'
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
          // Send email notifications for each updated candidate
          for (const candidate of candidatesToUpdate) {
            try {
              const dashboardUrl = `${window.location.origin}/dashboard`
              await supabase.functions.invoke('send-status-email', {
                body: {
                  to: session?.user?.email,
                  candidateName: candidate.name,
                  jobTitle: jobData.title,
                  dashboardUrl
                }
              })
              console.log('Email notification sent for candidate:', candidate.name)
            } catch (error) {
              console.error('Error sending email notification:', error)
            }
          }

          // Update the local data to reflect the changes
          data.forEach(candidate => {
            if (candidatesToUpdate.find(c => c.id === candidate.id)) {
              candidate.status = 'reviewing'
            }
          })
        }
      }

      return data as Candidate[]
    },
    enabled: !!jobId && !!session?.user?.id,
    refetchInterval: 5000, // Refetch every 5 seconds to catch new uploads
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
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidateId)

      if (error) throw error

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

  // Filter candidates based on their status
  const readyForReview = candidates?.filter(c => 
    c.status === 'reviewing'
  ) || []

  const awaitingResponse = candidates?.filter(c => 
    c.status === 'requested' && !c.video_url
  ) || []

  const approvedCandidates = candidates?.filter(c => 
    c.status === 'approved'
  ) || []

  const rejectedCandidates = candidates?.filter(c => 
    c.status === 'rejected'
  ) || []

  return {
    readyForReview,
    awaitingResponse,
    approvedCandidates,
    rejectedCandidates,
    handleReviewAction,
    getVideoUrl
  }
}