import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, ThumbsDown, ThumbsUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import type { Candidate } from "@/types/candidate"
import { format } from "date-fns"

interface VideoReviewModalProps {
  jobId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoReviewModal({ jobId, open, onOpenChange }: VideoReviewModalProps) {
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
      
      console.log('Fetched candidates:', data)
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

    // Open in new window with candidate name in title
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

  const readyForReview = candidates?.filter(c => 
    c.video_url && (c.status === 'new' || c.status === 'reviewing')
  ) || []

  const awaitingResponse = candidates?.filter(c => 
    (!c.video_url && c.video_token) || c.status === 'invited'
  ) || []

  const approvedCandidates = candidates?.filter(c => 
    c.status === 'accepted'
  ) || []

  const rejectedCandidates = candidates?.filter(c => 
    c.status === 'rejected'
  ) || []

  const CandidateList = ({ candidates, showActions = false }: { 
    candidates: Candidate[], 
    showActions?: boolean 
  }) => (
    <div className="space-y-4">
      {candidates.map(candidate => (
        <div 
          key={candidate.id} 
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div>
            <h4 className="font-medium">{candidate.name}</h4>
            <p className="text-sm text-muted-foreground">{candidate.email}</p>
            {candidate.video_url && (
              <p className="text-xs text-muted-foreground">
                Uploaded {format(new Date(candidate.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {candidate.video_url && (
              <Button
                variant="secondary"
                onClick={() => getVideoUrl(candidate.video_url!, candidate.name)}
              >
                Review Video
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(`tel:${candidate.phone}`, '_blank')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            {showActions && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleReviewAction(candidate.id, 'accepted')}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleReviewAction(candidate.id, 'rejected')}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
      {candidates.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No candidates in this category
        </p>
      )}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Candidates</DialogTitle>
          <DialogDescription>
            Review and manage candidate video submissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h3 className="font-semibold mb-4">Ready for Review ({readyForReview.length})</h3>
            <CandidateList candidates={readyForReview} showActions />
          </section>

          <section>
            <h3 className="font-semibold mb-4">Approved Candidates ({approvedCandidates.length})</h3>
            <CandidateList candidates={approvedCandidates} />
          </section>

          <section>
            <h3 className="font-semibold mb-4">Awaiting Response ({awaitingResponse.length})</h3>
            <CandidateList candidates={awaitingResponse} />
          </section>

          <section>
            <h3 className="font-semibold mb-4">Rejected Candidates ({rejectedCandidates.length})</h3>
            <CandidateList candidates={rejectedCandidates} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
