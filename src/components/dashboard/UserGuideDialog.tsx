import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Info, BookOpen, Video, Play, Check, ArrowRight } from "lucide-react"

const steps = [
  {
    title: "Add Candidates",
    description: "Start by creating a job opening and adding candidates:",
    icon: BookOpen,
    items: [
      "Create a job opening with title, department, and location",
      "Import candidates via CSV (ie. from Indeed)",
      "Add candidates manually with basic information"
    ]
  },
  {
    title: "Request Videos",
    description: "Send video requests to your candidates:",
    icon: Video,
    items: [
      "Select candidates to request videos from",
      "Send automated email or SMS invitations",
      "Track invitation status and responses"
    ]
  },
  {
    title: "Review Responses",
    description: "Review and manage video responses:",
    icon: Play,
    items: [
      "Watch candidate video introductions",
      "Make decisions directly from the review queue",
      "Track response rates and engagement"
    ]
  }
]

interface UserGuideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserGuideDialog({ open, onOpenChange }: UserGuideDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onOpenChange(false)
      setCurrentStep(0)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Getting Started Guide
          </DialogTitle>
          <DialogDescription>
            Follow these steps to start reviewing candidate videos
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {steps[currentStep].icon && (
                <div className="mt-1">
                  {(() => {
                    const IconComponent = steps[currentStep].icon
                    return <IconComponent className="h-5 w-5 text-primary" />
                  })()}
                </div>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold">
                  {currentStep + 1}. {steps[currentStep].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep].description}
                </p>
                <ul className="space-y-2">
                  {steps[currentStep].items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 mt-0.5 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Skip guide
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? (
                <>
                  Next step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Get started"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}