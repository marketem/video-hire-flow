import { Users, VideoIcon, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardStats() {
  const supabase = useSupabaseClient();

  const { data: candidatesCount = 0, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['candidates-count'],
    queryFn: async () => {
      const { data: openJobIds } = await supabase
        .from('job_openings')
        .select('id')
        .eq('status', 'open');

      if (!openJobIds) return 0;

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
      const { data: openJobIds } = await supabase
        .from('job_openings')
        .select('id')
        .eq('status', 'open');

      if (!openJobIds) return 0;

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

  return (
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
  );
}