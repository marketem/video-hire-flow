import { Button } from "@/components/ui/button"
import { Send, Trash2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface BulkActionsProps {
  selectedCount: number
  onSendInvites: () => void
  onDelete: () => void
}

export function BulkActions({ selectedCount, onSendInvites, onDelete }: BulkActionsProps) {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted rounded-lg">
      {selectedCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {selectedCount} candidates selected
        </span>
      )}
      <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <Button
          size={isMobile ? "default" : "sm"}
          onClick={onSendInvites}
          disabled={selectedCount === 0}
          className="flex-1 sm:flex-initial"
        >
          <Send className="mr-2 h-4 w-4" />
          {isMobile ? "Request Video" : "Request Video Submission"}
        </Button>
        <Button
          size={isMobile ? "default" : "sm"}
          variant="destructive"
          onClick={onDelete}
          disabled={selectedCount === 0}
          className="flex-1 sm:flex-initial"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}