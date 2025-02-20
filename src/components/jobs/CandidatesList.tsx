import { useEffect } from "react"
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
  const { candidates, isLoading, fetchCandidates } = useJobCandidates(jobId)
  const { selectedCandidates, setSelectedCandidates, toggleSelectAll, toggleCandidate } = useCandidateSelection()
  const { sendVideoInvites } = useSendVideoInvites(jobId)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    // Subscribe to real-time updates for the candidates table
    const channel = supabase
      .channel('candidates-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidates',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload)
          fetchCandidates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId, fetchCandidates, supabase])

  const handleSendInvites = async () => {
    const success = await sendVideoInvites(selectedCandidates, candidates || [])
    if (success) {
      // Update status to 'requested' for selected candidates
      const { error } = await supabase
        .from('candidates')
        .update({ status: 'requested' })
        .in('id', selectedCandidates)

      if (error) {
        console.error('Error updating candidate statuses:', error)
      }

      setSelectedCandidates([])
      fetchCandidates()
    }
  }

  const handleDelete = async () => {
    if (!selectedCandidates.length) return

    try {
      console.log('Attempting to delete candidates:', selectedCandidates)
      
      const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', selectedCandidates)

      if (error) {
        console.error('Supabase deletion error:', error)
        throw error
      }

      console.log('Deletion successful')
      
      setSelectedCandidates([])
      await fetchCandidates()
      
      toast({
        title: "Success",
        description: `${selectedCandidates.length} candidate(s) deleted successfully`,
      })
    } catch (error) {
      console.error('Error deleting candidates:', error)
      toast({
        title: "Error",
        description: "Failed to delete candidates. Please try again.",
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

  const allSelected = selectedCandidates.length === candidates.length

  return (
    <div className="space-y-4">
      <BulkActions
        selectedCount={selectedCandidates.length}
        totalCount={candidates.length}
        onSendInvites={handleSendInvites}
        onDelete={handleDelete}
        onToggleSelectAll={(checked) => toggleSelectAll(candidates, checked)}
        allSelected={allSelected}
      />
      <CandidatesTable
        candidates={candidates}
        selectedCandidates={selectedCandidates}
        onToggleSelect={toggleCandidate}
        onToggleSelectAll={(checked) => toggleSelectAll(candidates, checked)}
        jobId={jobId}
      />
    </div>
  )
}