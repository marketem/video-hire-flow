import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, ThumbsDown, ThumbsUp, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Candidate } from "@/types/candidate"

interface VideoReviewModalProps {
  jobId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoReviewModal({ jobId, open, onOpenChange }: VideoReviewModalProps) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const { data: candidates, refetch } = useQuery({
    queryKey: ['candidates-review', jobId],
    queryFn: async () => {
      if (!jobId) return null
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .not('video_url', 'is', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Candidate[]
    },
    enabled: !!jobId,
  })

  const handleReviewAction = async (candidateId: string, status: 'reviewing' | 'rejected' | 'accepted') => {
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
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive",
      })
    }
  }

  const readyForReview = candidates?.filter(c => 
    c.video_url && c.status === 'new'
  ) || []

  const awaitingResponse = candidates?.filter(c => 
    !c.video_url && c.video_token
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
          </div>
          <div className="flex gap-2">
            {candidate.video_url && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(candidate.video_url, '_blank')}
              >
                <Video className="h-4 w-4" />
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