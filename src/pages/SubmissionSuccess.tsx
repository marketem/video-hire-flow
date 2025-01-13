import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function SubmissionSuccess() {
  const handleClose = () => {
    // Try to close the window
    window.close()
    
    // If window.close() didn't work (common in some browsers), 
    // redirect to blank page as fallback
    setTimeout(() => {
      window.location.href = "about:blank"
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h1 className="text-2xl font-bold">Thank You for Your Submission!</h1>
        <p className="text-muted-foreground">
          Your video has been successfully uploaded. The hiring manager will review your application and will be in touch if it's a good fit.
        </p>
        <Button onClick={handleClose} variant="outline">
          Close Window
        </Button>
      </div>
    </div>
  )
}