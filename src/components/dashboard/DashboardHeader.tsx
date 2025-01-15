import { useSession } from "@supabase/auth-helpers-react";
import { AccountMenu } from "./AccountMenu";

export function DashboardHeader() {
  const session = useSession();

  return (
    <div className="flex flex-col gap-2 mb-4 md:mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-3xl font-bold truncate pr-4">
          Welcome, {session?.user.user_metadata.first_name || 'User'}!
        </h1>
        <AccountMenu />
      </div>
      {session?.user.user_metadata.trial_ends_at && (
        <p className="text-sm text-muted-foreground">
          Trial ends in {Math.ceil(
            (new Date(session.user.user_metadata.trial_ends_at).getTime() -
              Date.now()) /
              (1000 * 60 * 60 * 24)
          )} days
        </p>
      )}
    </div>
  );
}