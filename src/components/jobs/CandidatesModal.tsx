import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
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
    <Tabs defaultValue="list" className="h-full flex flex-col">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="list" className="flex-1">Candidates</TabsTrigger>
        <TabsTrigger value="add" className="flex-1">Add Candidate</TabsTrigger>
        <TabsTrigger value="import" className="flex-1">Import</TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden mt-4">
        <ScrollArea className="h-[60vh]">
          <TabsContent value="list" className="space-y-4 mt-0">
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

          <TabsContent value="add" className="mt-0">
            <AddCandidateForm jobId={jobId} onSuccess={fetchCandidates} />
          </TabsContent>

          <TabsContent value="import" className="mt-0">
            <UploadCandidates jobId={jobId} onSuccess={fetchCandidates} />
          </TabsContent>
        </ScrollArea>
      </div>
    </Tabs>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Manage Candidates</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden p-6 pt-4">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Manage Candidates</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-6 pt-4">{content}</div>
      </DialogContent>
    </Dialog>
  )
}