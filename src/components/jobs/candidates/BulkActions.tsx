import { Button } from "@/components/ui/button"
import { Send, Trash2 } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Checkbox } from "@/components/ui/checkbox"
import { usePremiumAccess } from "@/hooks/usePremiumAccess"

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
  const hasPremiumAccess = usePremiumAccess()

  const isOverLimit = !hasPremiumAccess && selectedCount > 5

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
          disabled={selectedCount === 0 || isSending || isOverLimit}
          className="flex-1 sm:flex-initial"
          title={isOverLimit ? "Free trial users can only send 5 video requests per day" : undefined}
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
      {isOverLimit && (
        <div className="w-full text-sm text-destructive">
          Free trial users can only send 5 video requests per day. Upgrade to premium for unlimited requests.
        </div>
      )}
    </div>
  )
}