import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Candidates List</TabsTrigger>
          <TabsTrigger value="add">Add Candidate</TabsTrigger>
          <TabsTrigger value="upload">Upload Candidates CSV</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <CandidatesList jobId={jobId} />
        </TabsContent>
        <TabsContent value="add">
          <AddCandidateForm jobId={jobId} onSuccess={() => setActiveTab("list")} />
        </TabsContent>
        <TabsContent value="upload">
          <UploadCandidates jobId={jobId} onSuccess={() => setActiveTab("list")} />
        </TabsContent>
      </Tabs>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Candidates for {jobTitle}</DrawerTitle>
            <DrawerDescription>
              View, add, or upload candidates for this position
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Candidates for {jobTitle}</DialogTitle>
          <DialogDescription>
            View, add, or upload candidates for this position
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}