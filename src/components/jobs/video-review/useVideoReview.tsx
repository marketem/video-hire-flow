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
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching candidates:', error)
        throw error
      }

      // Update status to 'reviewing' for candidates with videos
      const updatedData = data.map((candidate: Candidate) => {
        if (candidate.video_url && candidate.status === 'requested') {
          return { ...candidate, status: 'reviewing' }
        }
        return candidate
      })
      
      // Update the database with the new statuses
      for (const candidate of updatedData) {
        if (candidate.video_url && candidate.status === 'reviewing') {
          await supabase
            .from('candidates')
            .update({ status: 'reviewing' })
            .eq('id', candidate.id)
        }
      }
      
      return updatedData as Candidate[]
    },
    enabled: !!jobId && !!session,
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

  const getVideoUrl = async (videoPath: string, candidateName: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view videos",
        variant: "destructive",
      })
      navigate('/login')
      return
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
        return
      }

      console.log('Opening video in new window:', data.signedUrl)
      const videoWindow = window.open('', '_blank')
      if (videoWindow) {
        videoWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Video Review - ${candidateName}</title>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { 
                  margin: 0; 
                  background: #000; 
                  display: flex; 
                  flex-direction: column; 
                  min-height: 100vh; 
                  font-family: system-ui, -apple-system, sans-serif;
                }
                .header { 
                  background: #1a1a1a; 
                  color: white; 
                  padding: 1rem; 
                }
                .video-container { 
                  flex: 1; 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  padding: 2rem;
                }
                video { 
                  max-width: 100%; 
                  max-height: 80vh;
                  background: #000;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>${candidateName}</h2>
              </div>
              <div class="video-container">
                <video 
                  controls 
                  playsinline
                  preload="auto"
                  crossorigin="anonymous"
                >
                  <source src="${data.signedUrl}" type="video/webm">
                  <source src="${data.signedUrl}" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </div>
              <script>
                document.querySelector('video').addEventListener('error', function(e) {
                  console.error('Video error:', e);
                });
              </script>
            </body>
          </html>
        `)
        videoWindow.document.close()
      }
    } catch (error) {
      console.error('Error in getVideoUrl:', error)
      toast({
        title: "Error",
        description: "Failed to open video review window",
        variant: "destructive",
      })
    }
  }

  // Filter candidates based on their status
  const readyForReview = candidates?.filter(c => 
    c.status === 'reviewing' || (c.video_url && c.status === 'requested')
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