import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CandidateStatusBadge } from "./CandidateStatusBadge"
import { EditCandidateSheet } from "./EditCandidateSheet"
import { type Candidate } from "@/types/candidate"
import { useIsMobile } from "@/hooks/use-mobile"
import { FileText, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
            <div key={candidate.id} className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={selectedCandidates.includes(candidate.id)}
                    onCheckedChange={(checked) => onToggleSelect(candidate.id, checked as boolean)}
                  />
                  <div>
                    <h3 className="font-medium">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                  </div>
                </div>
                <CandidateStatusBadge status={candidate.status} />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  {candidate.video_token ? new Date(candidate.created_at).toLocaleDateString() : 'No'}
                </div>
                <div className="flex items-center gap-2">
                  {candidate.resume_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(candidate.resume_url, '_blank')}
                      title="View Resume"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditClick(candidate)}>
                        Edit Candidate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyInviteUrl(candidate)}>
                        Copy Invite URL
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
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
            <TableRow key={candidate.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedCandidates.includes(candidate.id)}
                  onCheckedChange={(checked) => onToggleSelect(candidate.id, checked as boolean)}
                />
              </TableCell>
              <TableCell className="font-medium">{candidate.name}</TableCell>
              <TableCell>{candidate.email}</TableCell>
              <TableCell>{candidate.phone}</TableCell>
              <TableCell>
                <CandidateStatusBadge status={candidate.status} />
              </TableCell>
              <TableCell>
                {candidate.resume_url ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(candidate.resume_url, '_blank')}
                    title="View Resume"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                ) : (
                  <span className="text-muted-foreground text-sm">No resume</span>
                )}
              </TableCell>
              <TableCell>
                {candidate.video_token ? new Date(candidate.created_at).toLocaleDateString() : 'No'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditClick(candidate)}>
                      Edit Candidate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyInviteUrl(candidate)}>
                      Copy Invite URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
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