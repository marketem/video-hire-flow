import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useState } from "react"
import { usePremiumAccess } from "@/hooks/usePremiumAccess"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"

interface PremiumFeatureProps {
  children: React.ReactNode
  featureName: string
}

export function PremiumFeature({ children, featureName }: PremiumFeatureProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const hasPremiumAccess = usePremiumAccess()
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

  if (hasPremiumAccess) {
    return <>{children}</>
  }

  return (
    <>
      <div onClick={() => setShowUpgradeDialog(true)}>
        {children}
      </div>
      
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Premium Feature</AlertDialogTitle>
            <AlertDialogDescription>
              The {featureName} feature is only available with a premium subscription. Upgrade now to unlock all premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartSubscription}>
              Upgrade Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}