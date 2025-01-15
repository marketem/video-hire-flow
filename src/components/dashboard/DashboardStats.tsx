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
    <div className="grid gap-3 md:gap-6 grid-cols-3 mb-4 md:mb-8">
      <Card className="bg-card/50 border-muted p-2 md:p-4">
        <CardHeader className="flex flex-row items-center justify-between p-0 md:pb-2 space-y-0">
          <CardTitle className="text-xs md:text-sm font-medium">Total Candidates</CardTitle>
          <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0 md:pt-2">
          <div className="text-lg md:text-2xl font-bold">
            {isLoadingCandidates ? "..." : candidatesCount}
          </div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Open jobs
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-muted p-2 md:p-4">
        <CardHeader className="flex flex-row items-center justify-between p-0 md:pb-2 space-y-0">
          <CardTitle className="text-xs md:text-sm font-medium">Response Rate</CardTitle>
          <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0 md:pt-2">
          <div className="text-lg md:text-2xl font-bold">{responseRate}%</div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Of invited
          </p>
        </CardContent>
      </Card>
      <Card className="bg-card/50 border-muted p-2 md:p-4">
        <CardHeader className="flex flex-row items-center justify-between p-0 md:pb-2 space-y-0">
          <CardTitle className="text-xs md:text-sm font-medium">Videos</CardTitle>
          <VideoIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0 md:pt-2">
          <div className="text-lg md:text-2xl font-bold">{videoResponsesCount}</div>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Responses
          </p>
        </CardContent>
      </Card>
    </div>
  );
}