import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, VideoIcon, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { JobOpenings } from "@/components/jobs/JobOpenings";
import { VideoReviewCards } from "@/components/jobs/video-review/VideoReviewCards";

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

  const { data: candidatesCount = 0, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['candidates-count'],
    queryFn: async () => {
      // First get the IDs of open jobs
      const { data: openJobIds } = await supabase
        .from('job_openings')
        .select('id')
        .eq('status', 'open');

      if (!openJobIds) return 0;

      // Then count all candidates from those jobs
      const { count, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .in('job_id', openJobIds.map(job => job.id));

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: videoResponsesCount = 0 } = useQuery({
    queryKey: ['video-responses-count'],
    queryFn: async () => {
      // First get the IDs of open jobs
      const { data: openJobIds } = await supabase
        .from('job_openings')
        .select('id')
        .eq('status', 'open');

      if (!openJobIds) return 0;

      // Then count video responses from those jobs
      const { count, error } = await supabase
        .from('candidates')
        .select('*', { count: 'exact', head: true })
        .not('video_url', 'is', null)
        .in('job_id', openJobIds.map(job => job.id));

      if (error) throw error;
      return count || 0;
    },
  });

  const responseRate = candidatesCount > 0 
    ? Math.round((videoResponsesCount / candidatesCount) * 100)
    : 0;

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {session.user.user_metadata.first_name || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          {session.user.user_metadata.trial_ends_at ? (
            `Trial ends in ${Math.ceil(
              (new Date(session.user.user_metadata.trial_ends_at).getTime() -
                Date.now()) /
                (1000 * 60 * 60 * 24)
            )} days`
          ) : 'Trial status not available'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Open Candidates</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingCandidates ? "..." : candidatesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all open jobs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Video Response Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of invited candidates
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Video Responses</CardTitle>
            <VideoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{videoResponsesCount}</div>
            <p className="text-xs text-muted-foreground">
              Total responses received
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <VideoReviewCards />
        <JobOpenings />
      </div>
    </div>
  );
}