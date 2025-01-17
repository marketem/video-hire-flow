import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardStats } from "@/components/dashboard/DashboardStats"
import { JobOpenings } from "@/components/jobs/JobOpenings"
import { VideoReviewCards } from "@/components/jobs/video-review/VideoReviewCards"
import { CandidateNotifications } from "@/components/jobs/notifications/CandidateNotifications"
import { UserGuideDialog } from "@/components/dashboard/UserGuideDialog"
import { useQuery } from "@tanstack/react-query"

export default function Dashboard() {
  const session = useSession()
  const navigate = useNavigate()
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  const [showGuide, setShowGuide] = useState(false)
  const [searchParams] = useSearchParams()
  const [isViewOnlyMode, setIsViewOnlyMode] = useState(false)

  // Fetch user profile data including login count and premium status
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!session?.user?.id
  })

  // Handle payment status from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      toast({
        title: "Payment successful",
        description: "Your subscription has been activated",
      })
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "Your payment was not processed",
      })
    }
  }, [searchParams, toast])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the dashboard",
          variant: "destructive",
        })
        navigate("/login")
      }
    }

    checkSession()
  }, [navigate, supabase.auth, toast])

  useEffect(() => {
    if (!session?.user || !profile) {
      return
    }

    if (profile.login_count === 1) {
      setShowGuide(true)
    }

    // Set view-only mode if user doesn't have premium access
    if (!profile.has_premium_access) {
      setIsViewOnlyMode(true)
      toast({
        title: "View-Only Mode Activated",
        description: "You can browse but interactions are limited. Upgrade anytime to unlock all features.",
      })
    }
  }, [session, profile, toast])

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="backdrop-blur-sm bg-white/50 dark:bg-black/20 rounded-xl p-8 shadow-lg">
          <DashboardHeader />
          <div className={isViewOnlyMode ? 'pointer-events-none select-none opacity-50' : ''}>
            <DashboardStats />
            <div className="space-y-8">
              <VideoReviewCards />
              <JobOpenings />
            </div>
            <CandidateNotifications />
          </div>
        </div>
        <UserGuideDialog
          open={showGuide}
          onOpenChange={setShowGuide}
        />
      </div>
    </div>
  )
}