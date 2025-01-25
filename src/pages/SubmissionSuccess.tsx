import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function SubmissionSuccess() {
  const location = useLocation()
  const { toast } = useToast()
  const candidateData = location.state?.candidateData

  useEffect(() => {
    const sendNotification = async () => {
      if (!candidateData) return

      try {
        const { error } = await supabase.functions.invoke('send-video-notification', {
          body: {
            candidateId: candidateData.id,
            candidateName: candidateData.name,
            candidateEmail: candidateData.email
          }
        })

        if (error) {
          console.error('Error sending notification:', error)
          toast({
            variant: "destructive",
            title: "Notification Error",
            description: "There was a problem sending the confirmation email."
          })
        }
      } catch (error) {
        console.error('Error invoking function:', error)
      }
    }

    sendNotification()
  }, [candidateData, toast])

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