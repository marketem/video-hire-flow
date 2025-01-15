import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Mic } from "lucide-react"

interface WelcomeModalProps {
  isOpen: boolean
  onStartSetup: () => Promise<void>
}

export function WelcomeModal({ isOpen, onStartSetup }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} modal>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Your Video Introduction</DialogTitle>
          <DialogDescription>
            <div className="space-y-4 pt-4">
              <div>
                We're excited to learn more about you! Here are some tips for a great video:
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>Find a quiet, well-lit space</li>
                <li>Be yourself and speak naturally</li>
                <li>Keep it brief - aim for 30 seconds</li>
                <li>Share what makes you unique</li>
              </ul>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            onClick={onStartSetup}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            <Mic className="mr-2 h-4 w-4" />
            Turn On Camera & Mic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}