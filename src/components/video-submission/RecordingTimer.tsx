import { Progress } from "@/components/ui/progress"

interface RecordingTimerProps {
  timeLeft: number
}

export function RecordingTimer({ timeLeft }: RecordingTimerProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Time remaining:</span>
        <span className="text-sm font-medium">{timeLeft}s</span>
      </div>
      <Progress value={((30 - timeLeft) / 30) * 100} />
    </div>
  )
}