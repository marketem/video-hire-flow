import { useSession } from "@supabase/auth-helpers-react";
import { AccountMenu } from "./AccountMenu";

export function DashboardHeader() {
  const session = useSession();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold break-words max-w-full">
        Welcome, {session?.user.user_metadata.first_name || 'User'}!
      </h1>
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        <p className="text-sm sm:text-base text-muted-foreground">
          {session?.user.user_metadata.trial_ends_at ? (
            `Trial ends in ${Math.ceil(
              (new Date(session.user.user_metadata.trial_ends_at).getTime() -
                Date.now()) /
                (1000 * 60 * 60 * 24)
            )} days`
          ) : 'Trial status not available'}
        </p>
        <AccountMenu />
      </div>
    </div>
  );
}