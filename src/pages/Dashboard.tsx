import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { JobOpenings } from "@/components/jobs/JobOpenings";
import { VideoReviewCards } from "@/components/jobs/video-review/VideoReviewCards";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader />
        <ScrollArea className="h-[calc(100vh-6rem)]">
          <div className="space-y-8 pb-8">
            <section>
              <DashboardStats />
            </section>
            
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">Video Reviews</h2>
                <p className="text-sm text-muted-foreground">
                  Review and manage candidate video submissions
                </p>
              </div>
              <VideoReviewCards />
            </section>
            
            <Separator className="my-8" />
            
            <section>
              <JobOpenings />
            </section>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}