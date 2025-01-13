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
      
      return data as Candidate[]
    },
    enabled: !!jobId && !!session,
  })

  const handleReviewAction = async (candidateId: string, status: 'reviewing' | 'rejected' | 'accepted') => {
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

    const { data, error } = await supabase
      .storage
      .from('videos')
      .createSignedUrl(videoPath, 3600, {
        download: false,
        transform: {
          width: 800,
          height: 600,
          resize: 'contain'
        }
      })

    if (error || !data?.signedUrl) {
      toast({
        title: "Error",
        description: "Could not access video. Please try again.",
        variant: "destructive",
      })
      return
    }

    const videoWindow = window.open('', '_blank')
    if (videoWindow) {
      videoWindow.document.write(`
        <html>
          <head>
            <title>Video Review - ${candidateName}</title>
            <style>
              body { margin: 0; background: #000; display: flex; flex-direction: column; min-height: 100vh; }
              .header { background: #1a1a1a; color: white; padding: 1rem; font-family: system-ui; }
              .video-container { flex: 1; display: flex; justify-content: center; align-items: center; }
              video { max-width: 100%; max-height: 80vh; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${candidateName}</h2>
            </div>
            <div class="video-container">
              <video controls src="${data.signedUrl}"></video>
            </div>
          </body>
        </html>
      `)
    }
  }

  // Update the filtering logic to consider video_url presence
  const readyForReview = candidates?.filter(c => 
    c.video_url && !['accepted', 'rejected'].includes(c.status)
  ) || []

  const awaitingResponse = candidates?.filter(c => 
    (!c.video_url && c.video_token) || ['invited', 'requested'].includes(c.status)
  ) || []

  const approvedCandidates = candidates?.filter(c => 
    c.status === 'accepted'
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