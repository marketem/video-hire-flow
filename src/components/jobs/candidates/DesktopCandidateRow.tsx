import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { TableCell, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, MoreHorizontal } from "lucide-react"
import { CandidateStatusBadge } from "./CandidateStatusBadge"
import type { Candidate } from "@/types/candidate"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"

interface DesktopCandidateRowProps {
  candidate: Candidate
  isSelected: boolean
  onToggleSelect: (candidateId: string, checked: boolean) => void
  onEditClick: (candidate: Candidate) => void
  onCopyInviteUrl: (candidate: Candidate) => void
}

export function DesktopCandidateRow({
  candidate,
  isSelected,
  onToggleSelect,
  onEditClick,
  onCopyInviteUrl
}: DesktopCandidateRowProps) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()

  const handleCopyInviteUrl = async () => {
    try {
      // Update status to 'requested' if it's 'new'
      if (candidate.status === 'new') {
        const { error } = await supabase
          .from('candidates')
          .update({ status: 'requested' })
          .eq('id', candidate.id)

        if (error) {
          console.error('Error updating candidate status:', error)
          return
        }

        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ['job-candidates'] })
        queryClient.invalidateQueries({ queryKey: ['candidates-review'] })
      }

      // Proceed with copying the URL regardless of status
      onCopyInviteUrl(candidate)
    } catch (error) {
      console.error('Error in handleCopyInviteUrl:', error)
    }
  }

  return (
    <TableRow>
      <TableCell>
        <Checkbox 
          checked={isSelected}
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
            <DropdownMenuItem onClick={() => onEditClick(candidate)}>
              Edit Candidate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyInviteUrl}>
              Copy Invite URL
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}