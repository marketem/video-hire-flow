import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { JobOpenings } from "@/components/jobs/JobOpenings";
import { VideoReviewCards } from "@/components/jobs/video-review/VideoReviewCards";
import { CandidateNotifications } from "@/components/jobs/notifications/CandidateNotifications";
import { UserGuideDialog } from "@/components/dashboard/UserGuideDialog";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const [showGuide, setShowGuide] = useState(false);

  // Fetch user profile data including login count
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      console.log('Fetching profile for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      console.log('Profile data:', data);
      return data;
    },
    enabled: !!session?.user?.id
  });

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
      console.log('Session or profile not available:', { 
        session: !!session, 
        profile: !!profile 
      });
      return;
    }

    console.log('Checking first time user:', { 
      userId: session.user.id,
      loginCount: profile.login_count,
      shouldShowGuide: profile.login_count === 1
    });

    // Show guide if this is their first login (login_count === 1)
    if (profile.login_count === 1) {
      console.log('First time user detected (login_count = 1), showing guide');
      setShowGuide(true);
    }
  }, [session, profile]);

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
    </div>
  );
}