import { useSession } from "@supabase/auth-helpers-react";
import { AccountMenu } from "./AccountMenu";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader() {
  const session = useSession();

  const daysLeft = session?.user.user_metadata.trial_ends_at
    ? Math.ceil(
        (new Date(session.user.user_metadata.trial_ends_at).getTime() -
          Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="flex justify-between items-center py-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user.user_metadata.first_name || 'User'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your job openings and review candidate videos
        </p>
      </div>
      <div className="flex items-center gap-6">
        {daysLeft && (
          <Badge variant="secondary" className="px-3 py-1">
            Trial ends in {daysLeft} days
          </Badge>
        )}
        <AccountMenu />
      </div>
    </div>
  );
}