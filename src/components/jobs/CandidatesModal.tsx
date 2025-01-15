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
    <div className="flex flex-col h-full">
      <Tabs defaultValue="list" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="list" className="flex-1">Candidates</TabsTrigger>
          <TabsTrigger value="add" className="flex-1">Add Candidate</TabsTrigger>
          <TabsTrigger value="import" className="flex-1">Import</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 h-[calc(90vh-8rem)] px-4">
          <div className="py-4 min-h-full">
            <TabsContent value="list" className="m-0 mt-0">
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

            <TabsContent value="add" className="m-0 mt-0">
              <AddCandidateForm jobId={jobId} onSuccess={fetchCandidates} />
            </TabsContent>

            <TabsContent value="import" className="m-0 mt-0">
              <UploadCandidates jobId={jobId} onSuccess={fetchCandidates} />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-xl p-0">
          <SheetHeader className="p-6 pb-0">
            <SheetTitle>Manage Candidates</SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Manage Candidates</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}