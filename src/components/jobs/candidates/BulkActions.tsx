import { Button } from "@/components/ui/button"
import { Send, Trash2 } from "lucide-react"

interface BulkActionsProps {
  selectedCount: number
  onSendInvites: () => void
  onDelete: () => void
}

export function BulkActions({ selectedCount, onSendInvites, onDelete }: BulkActionsProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
      {selectedCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {selectedCount} candidates selected
        </span>
      )}
      <div className="flex gap-2 ml-auto">
        <Button
          size="sm"
          onClick={onSendInvites}
          disabled={selectedCount === 0}
        >
          <Send className="mr-2 h-4 w-4" />
          Request Video Submission
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          disabled={selectedCount === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Candidates
        </Button>
      </div>
    </div>
  )
}