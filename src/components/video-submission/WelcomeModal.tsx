import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Mic } from "lucide-react"

interface WelcomeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartCamera: () => Promise<void>
}

export function WelcomeModal({ open, onOpenChange, onStartCamera }: WelcomeModalProps) {
  const handleStart = async () => {
    await onStartCamera()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Your Video Introduction!</DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p>
              We're excited to learn more about you! Here are some tips for a great video:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Find a quiet, well-lit space</li>
              <li>Position yourself in the center of the frame</li>
              <li>Speak clearly and naturally</li>
              <li>Keep it brief - you have 30 seconds</li>
              <li>Most importantly, be yourself!</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button onClick={handleStart} className="gap-2">
            <Camera className="h-4 w-4" />
            <Mic className="h-4 w-4" />
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}