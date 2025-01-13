import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { CandidateActions } from "./CandidateActions"
import { CandidateStatusBadge } from "./CandidateStatusBadge"
import { type Candidate } from "@/types/candidate"

interface CandidatesTableProps {
  candidates: Candidate[]
  selectedCandidates: string[]
  onToggleSelect: (candidateId: string, checked: boolean) => void
  onToggleSelectAll: (checked: boolean) => void
}

export function CandidatesTable({ 
  candidates,
  selectedCandidates,
  onToggleSelect,
  onToggleSelectAll,
}: CandidatesTableProps) {
  return (
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
          <TableHead>Resume</TableHead>
          <TableHead>Video</TableHead>
          <TableHead>Invite</TableHead>
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
              <CandidateActions.Resume url={candidate.resume_url} />
            </TableCell>
            <TableCell>
              <CandidateActions.Video url={candidate.video_url} />
            </TableCell>
            <TableCell>
              <CandidateActions.CopyLink candidateId={candidate.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}