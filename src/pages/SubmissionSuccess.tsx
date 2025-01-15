import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"

export default function SubmissionSuccess() {
  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      <div className="mb-8">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" 
            alt="VibeCheck Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold">VibeCheck</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Thank You for Your Submission!</h1>
          <p className="text-muted-foreground">
            Your video has been successfully uploaded. The hiring manager will review your application and will be in touch if it's a good fit.
          </p>
        </div>
      </div>
    </div>
  )
}