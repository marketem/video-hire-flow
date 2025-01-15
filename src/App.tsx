import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryConfig } from "./hooks/useQueryConfig";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { JobOpenings } from "@/components/jobs/JobOpenings";
import { VideoReviewCards } from "@/components/jobs/video-review/VideoReviewCards";

const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

function App() {
  const session = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabaseClient();

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

  if (!session) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        <DashboardStats />
        <div className="space-y-8">
          <VideoReviewCards />
          <JobOpenings />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
