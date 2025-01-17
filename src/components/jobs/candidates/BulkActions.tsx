import { Button } from "@/components/ui/button"
import { Send, Trash2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Checkbox } from "@/components/ui/checkbox"

interface BulkActionsProps {
  selectedCount: number
  totalCount: number
  onSendInvites: () => void
  onDelete: () => void
  onToggleSelectAll: (checked: boolean) => void
  allSelected: boolean
  isSending?: boolean
}

export function BulkActions({ 
  selectedCount, 
  totalCount,
  onSendInvites, 
  onDelete,
  onToggleSelectAll,
  allSelected,
  isSending = false
}: BulkActionsProps) {
  const isMobile = useIsMobile()

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Checkbox 
          checked={allSelected}
          onCheckedChange={onToggleSelectAll}
          id="select-all"
        />
        <label 
          htmlFor="select-all" 
          className="text-sm text-muted-foreground cursor-pointer"
        >
          {selectedCount > 0 
            ? `${selectedCount} of ${totalCount} selected`
            : "Select all"}
        </label>
      </div>
      <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
        <Button
          size={isMobile ? "default" : "sm"}
          onClick={onSendInvites}
          disabled={selectedCount === 0 || isSending}
          className="flex-1 sm:flex-initial"
        >
          <Send className="mr-2 h-4 w-4" />
          {isSending ? "Sending..." : (isMobile ? "Request Video" : "Request Video (via Text & Email)")}
        </Button>
        <Button
          size={isMobile ? "default" : "sm"}
          variant="destructive"
          onClick={onDelete}
          disabled={selectedCount === 0 || isSending}
          className="flex-1 sm:flex-initial"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}