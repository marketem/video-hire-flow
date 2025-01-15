import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { EditCandidateSheet } from "./EditCandidateSheet"
import { MobileCandidateCard } from "./MobileCandidateCard"
import { DesktopCandidateRow } from "./DesktopCandidateRow"
import { type Candidate } from "@/types/candidate"
import { useIsMobile } from "@/hooks/use-mobile"
import { useState } from "react"
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"
import { useToast } from "@/hooks/use-toast"

interface CandidatesTableProps {
  candidates: Candidate[]
  selectedCandidates: string[]
  onToggleSelect: (candidateId: string, checked: boolean) => void
  onToggleSelectAll: (checked: boolean) => void
  jobId: string
}

export function CandidatesTable({ 
  candidates,
  selectedCandidates,
  onToggleSelect,
  onToggleSelectAll,
  jobId
}: CandidatesTableProps) {
  const isMobile = useIsMobile()
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const { copyToClipboard } = useCopyToClipboard()
  const { toast } = useToast()

  const handleEditClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsEditSheetOpen(true)
  }

  const handleCopyInviteUrl = async (candidate: Candidate) => {
    if (!candidate.video_token) {
      toast({
        title: "Error",
        description: "No invite URL available for this candidate",
        variant: "destructive",
      })
      return
    }
    
    const inviteUrl = `${window.location.origin}/video-submission?token=${candidate.video_token}`
    const success = await copyToClipboard(inviteUrl)
    
    if (success) {
      toast({
        title: "Success",
        description: "Invite URL copied to clipboard",
      })
    }
  }

  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <MobileCandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidates.includes(candidate.id)}
              onToggleSelect={onToggleSelect}
              onEditClick={handleEditClick}
              onCopyInviteUrl={handleCopyInviteUrl}
            />
          ))}
        </div>
        <EditCandidateSheet
          candidate={selectedCandidate}
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          jobId={jobId}
        />
      </>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedCandidates.length === candidates.length}
                onCheckedChange={(checked) => onToggleSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Invited</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates?.map((candidate) => (
            <DesktopCandidateRow
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidates.includes(candidate.id)}
              onToggleSelect={onToggleSelect}
              onEditClick={handleEditClick}
              onCopyInviteUrl={handleCopyInviteUrl}
            />
          ))}
        </TableBody>
      </Table>
      <EditCandidateSheet
        candidate={selectedCandidate}
        open={isEditSheetOpen}
        onOpenChange={setIsEditSheetOpen}
        jobId={jobId}
      />
    </>
  )
}