import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"

interface PremiumModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewOnlyMode: () => void
}

export function PremiumModal({ open, onOpenChange, onViewOnlyMode }: PremiumModalProps) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const handleStartSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session')
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Time to Upgrade!</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              You've been enjoying our platform, and we're excited to see you're getting value from it!
            </p>
            <p>
              Upgrade now to unlock all premium features and continue growing your business.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onViewOnlyMode}>
            Continue in View-Only Mode
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleStartSubscription}>
            Upgrade Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}