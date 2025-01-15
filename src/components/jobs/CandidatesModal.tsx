import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { BulkActions } from "./candidates/BulkActions"
import { CandidatesTable } from "./candidates/CandidatesTable"
import { CandidatesEmpty } from "./candidates/CandidatesEmpty"
import { CandidatesLoading } from "./candidates/CandidatesLoading"
import { AddCandidateForm } from "./AddCandidateForm"
import { UploadCandidates } from "./UploadCandidates"
import { useJobCandidates } from "@/hooks/useJobCandidates"
import { useCandidateSelection } from "@/hooks/useCandidateSelection"
import { useCandidateActions } from "@/hooks/useCandidateActions"
import { useSendVideoInvites } from "@/hooks/useSendVideoInvites"

interface CandidatesModalProps {
  jobId: string
  jobTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidatesModal({
  jobId,
  jobTitle,
  open,
  onOpenChange,
}: CandidatesModalProps) {
  const isMobile = useIsMobile()
  const [isSending, setIsSending] = useState(false)
  const { candidates, isLoading, fetchCandidates } = useJobCandidates(jobId)
  const { selectedCandidates, toggleSelectAll, toggleCandidate, setSelectedCandidates } = useCandidateSelection()
  const { handleDelete } = useCandidateActions(jobId)
  const { sendVideoInvites } = useSendVideoInvites(jobId)

  const handleSendInvites = async () => {
    setIsSending(true)
    try {
      const success = await sendVideoInvites(selectedCandidates, candidates)
      if (success) {
        await fetchCandidates()
        setSelectedCandidates([])
      }
    } finally {
      setIsSending(false)
    }
  }

  const content = (
    <Tabs defaultValue="list" className="space-y-4">
      <TabsList>
        <TabsTrigger value="list">Candidates</TabsTrigger>
        <TabsTrigger value="add">Add Candidate</TabsTrigger>
        <TabsTrigger value="import">Import</TabsTrigger>
      </TabsList>

      <TabsContent value="list" className="space-y-4">
        {candidates?.length > 0 && (
          <BulkActions
            selectedCount={selectedCandidates.length}
            totalCount={candidates.length}
            onSendInvites={handleSendInvites}
            onDelete={() => handleDelete(selectedCandidates)}
            onToggleSelectAll={(checked) => toggleSelectAll(candidates, checked)}
            allSelected={selectedCandidates.length === candidates.length}
            isSending={isSending}
          />
        )}
        {isLoading ? (
          <CandidatesLoading />
        ) : candidates?.length === 0 ? (
          <CandidatesEmpty jobTitle={jobTitle} />
        ) : (
          <CandidatesTable
            candidates={candidates}
            selectedCandidates={selectedCandidates}
            onToggleSelect={toggleCandidate}
            onToggleSelectAll={(checked) => toggleSelectAll(candidates, checked)}
            jobId={jobId}
          />
        )}
      </TabsContent>

      <TabsContent value="add">
        <AddCandidateForm jobId={jobId} onSuccess={fetchCandidates} />
      </TabsContent>

      <TabsContent value="import">
        <UploadCandidates jobId={jobId} onSuccess={fetchCandidates} />
      </TabsContent>
    </Tabs>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Manage Candidates</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Candidates</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}