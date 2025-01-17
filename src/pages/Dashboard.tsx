import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { JobOpenings } from "@/components/jobs/JobOpenings";
import { VideoReviewCards } from "@/components/jobs/video-review/VideoReviewCards";
import { CandidateNotifications } from "@/components/jobs/notifications/CandidateNotifications";
import { UserGuideDialog } from "@/components/dashboard/UserGuideDialog";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const [showGuide, setShowGuide] = useState(false);
  const [searchParams] = useSearchParams();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  // Handle payment status from URL params
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast({
        title: "Payment successful",
        description: "Your subscription has been activated",
      });
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment cancelled",
        description: "Your payment was not processed",
      });
    }
  }, [searchParams, toast]);

  // Fetch user profile data including login count
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  // Check subscription status
  const { data: subscriptionData, isLoading: isCheckingSubscription } = useQuery({
    queryKey: ['subscription', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
    refetchInterval: 60000 // Refresh every minute
  });

  const handleStartSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access the dashboard",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkSession();
  }, [navigate, supabase.auth, toast]);

  useEffect(() => {
    if (!session?.user || !profile) {
      return;
    }

    if (profile.login_count === 1) {
      setShowGuide(true);
    }
  }, [session, profile]);

  useEffect(() => {
    if (subscriptionData?.status === 'expired') {
      setShowSubscriptionDialog(true);
    }
  }, [subscriptionData]);

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader />
      <DashboardStats />
      <div className="space-y-8">
        <VideoReviewCards />
        <JobOpenings />
      </div>
      <CandidateNotifications />
      <UserGuideDialog
        open={showGuide}
        onOpenChange={setShowGuide}
      />
      <AlertDialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Trial Period Expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your trial period has ended. To continue using all features, please subscribe to our service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartSubscription}>
              Subscribe Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}