import { CandidatesTable } from "./candidates/CandidatesTable"
import { BulkActions } from "./candidates/BulkActions"
import { CandidatesLoading } from "./candidates/CandidatesLoading"
import { CandidatesEmpty } from "./candidates/CandidatesEmpty"
import { useJobCandidates } from "@/hooks/useJobCandidates"
import { useCandidateSelection } from "@/hooks/useCandidateSelection"
import { useSendVideoInvites } from "@/hooks/useSendVideoInvites"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"

interface CandidatesListProps {
  jobId: string
}

export function CandidatesList({ jobId }: CandidatesListProps) {
  const { data: candidates, isLoading, refetch } = useJobCandidates(jobId)
  const { selectedCandidates, setSelectedCandidates, toggleSelectAll, toggleCandidate } = useCandidateSelection()
  const { sendVideoInvites } = useSendVideoInvites(jobId)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const handleSendInvites = async () => {
    const success = await sendVideoInvites(selectedCandidates, candidates || [])
    if (success) {
      setSelectedCandidates([])
    }
  }

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', selectedCandidates)

      if (error) throw error

      toast({
        title: "Success",
        description: `${selectedCandidates.length} candidate(s) deleted successfully`,
      })

      setSelectedCandidates([])
      refetch()
    } catch (error) {
      console.error('Error deleting candidates:', error)
      toast({
        title: "Error",
        description: "Failed to delete candidates",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <CandidatesLoading />
  }

  if (!candidates?.length) {
    return <CandidatesEmpty />
  }

  return (
    <div className="space-y-4">
      <BulkActions
        selectedCount={selectedCandidates.length}
        onSendInvites={handleSendInvites}
        onDelete={handleDelete}
      />
      <CandidatesTable
        candidates={candidates}
        selectedCandidates={selectedCandidates}
        onToggleSelect={toggleCandidate}
        onToggleSelectAll={(checked) => toggleSelectAll(candidates, checked)}
      />
    </div>
  )
}