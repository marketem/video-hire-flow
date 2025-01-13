import { CandidatesTable } from "./candidates/CandidatesTable"
import { BulkActions } from "./candidates/BulkActions"
import { CandidatesLoading } from "./candidates/CandidatesLoading"
import { CandidatesEmpty } from "./candidates/CandidatesEmpty"
import { useJobCandidates } from "@/hooks/useJobCandidates"
import { useCandidateSelection } from "@/hooks/useCandidateSelection"
import { useSendVideoInvites } from "@/hooks/useSendVideoInvites"

interface CandidatesListProps {
  jobId: string
}

export function CandidatesList({ jobId }: CandidatesListProps) {
  const { data: candidates, isLoading } = useJobCandidates(jobId)
  const { selectedCandidates, setSelectedCandidates, toggleSelectAll, toggleCandidate } = useCandidateSelection()
  const { sendVideoInvites } = useSendVideoInvites(jobId)

  const handleSendInvites = async () => {
    const success = await sendVideoInvites(selectedCandidates, candidates || [])
    if (success) {
      setSelectedCandidates([])
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