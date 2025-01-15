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
import { CandidateActions } from "./CandidateActions"
import { CandidateStatusBadge } from "./CandidateStatusBadge"
import { EditCandidateSheet } from "./EditCandidateSheet"
import { type Candidate } from "@/types/candidate"
import { useIsMobile } from "@/hooks/use-mobile"
import { Pencil } from "lucide-react"
import { useState } from "react"

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

  const handleEditClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsEditSheetOpen(true)
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
                  {new Date(candidate.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(candidate)}
                    title="Edit candidate"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <CandidateActions.Resume url={candidate.resume_url} />
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
            <TableHead>Applied</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(candidate)}
                    title="Edit candidate"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <CandidateActions.Resume url={candidate.resume_url} />
                </div>
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