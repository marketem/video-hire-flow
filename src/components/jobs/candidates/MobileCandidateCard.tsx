import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, MoreHorizontal } from "lucide-react"
import { CandidateStatusBadge } from "./CandidateStatusBadge"
import type { Candidate } from "@/types/candidate"

interface MobileCandidateCardProps {
  candidate: Candidate
  isSelected: boolean
  onToggleSelect: (candidateId: string, checked: boolean) => void
  onEditClick: (candidate: Candidate) => void
  onCopyInviteUrl: (candidate: Candidate) => void
  onStatusChange: (candidateId: string, status: 'reviewing' | 'rejected' | 'approved') => Promise<void>
}

export function MobileCandidateCard({
  candidate,
  isSelected,
  onToggleSelect,
  onEditClick,
  onCopyInviteUrl,
  onStatusChange
}: MobileCandidateCardProps) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Checkbox 
            checked={isSelected}
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
              <DropdownMenuItem onClick={() => onEditClick(candidate)}>
                Edit Candidate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyInviteUrl(candidate)}>
                Copy Invite URL
              </DropdownMenuItem>
              {candidate.status === 'reviewing' && (
                <>
                  <DropdownMenuItem onClick={() => onStatusChange(candidate.id, 'approved')}>
                    Approve Candidate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(candidate.id, 'rejected')}>
                    Reject Candidate
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}