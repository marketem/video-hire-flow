import { AlertCircle } from "lucide-react"
import { differenceInDays } from "date-fns"

interface PriorityIndicatorProps {
  oldestPending?: Date
}

export function PriorityIndicator({ oldestPending }: PriorityIndicatorProps) {
  if (!oldestPending) return null
  
  const now = new Date()
  const daysWaiting = differenceInDays(now, oldestPending)
  
  if (daysWaiting < 1) return null

  const dayText = daysWaiting === 1 ? 'day' : 'days'
  
  return (
    <div className="flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-4 w-4" />
      <span>Waiting {daysWaiting} {dayText}</span>
    </div>
  )
}