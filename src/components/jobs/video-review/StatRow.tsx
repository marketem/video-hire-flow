import { LucideIcon } from "lucide-react"

interface StatRowProps {
  icon?: LucideIcon
  count: number
  label: string
  isCircle?: boolean
  circleColor?: string
}

export function StatRow({ icon: Icon, count, label, isCircle, circleColor }: StatRowProps) {
  return (
    <div className="flex items-center gap-2">
      {isCircle ? (
        <div className={`flex items-center justify-center min-w-5 h-5 text-xs font-medium text-white ${circleColor} rounded-full px-1.5`}>
          {count}
        </div>
      ) : Icon && (
        <Icon className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-xs flex items-center gap-1">
        {!isCircle && (
          <span className="text-xs font-medium text-muted-foreground">
            ({count})
          </span>
        )}
        {label}
      </span>
    </div>
  )
}