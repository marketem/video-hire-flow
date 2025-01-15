import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CandidatesList } from "./CandidatesList"
import { AddCandidateForm } from "./AddCandidateForm"
import { UploadCandidates } from "./UploadCandidates"
import { useIsMobile } from "@/hooks/use-mobile"

interface CandidatesModalProps {
  jobId: string
  jobTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CandidatesModal({ jobId, jobTitle, open, onOpenChange }: CandidatesModalProps) {
  const [activeTab, setActiveTab] = useState("list")
  const isMobile = useIsMobile()

  const content = (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="list" className="text-xs sm:text-sm">Candidates</TabsTrigger>
          <TabsTrigger value="add" className="text-xs sm:text-sm">Add New</TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm">Upload CSV</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-0">
          <CandidatesList jobId={jobId} />
        </TabsContent>
        <TabsContent value="add" className="mt-0">
          <AddCandidateForm jobId={jobId} onSuccess={() => setActiveTab("list")} />
        </TabsContent>
        <TabsContent value="upload" className="mt-0">
          <UploadCandidates jobId={jobId} onSuccess={() => setActiveTab("list")} />
        </TabsContent>
      </Tabs>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-lg">{jobTitle}</SheetTitle>
            <SheetDescription className="text-sm">
              Manage candidates for this position
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{jobTitle}</DialogTitle>
          <DialogDescription>
            Manage candidates for this position
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}