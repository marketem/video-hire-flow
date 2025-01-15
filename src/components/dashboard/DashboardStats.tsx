import { Users, VideoIcon, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

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
      <div className="bg-muted/30 rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Candidates</p>
          <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-lg md:text-2xl font-bold">
            {isLoadingCandidates ? "..." : candidatesCount}
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Open jobs
          </p>
        </div>
      </div>
      <div className="bg-muted/30 rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Response Rate</p>
          <Activity className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-lg md:text-2xl font-bold">{responseRate}%</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Of invited
          </p>
        </div>
      </div>
      <div className="bg-muted/30 rounded-lg p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs md:text-sm font-medium text-muted-foreground">Videos</p>
          <VideoIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-lg md:text-2xl font-bold">{videoResponsesCount}</p>
          <p className="text-[10px] md:text-xs text-muted-foreground">
            Responses
          </p>
        </div>
      </div>
    </div>
  );
}