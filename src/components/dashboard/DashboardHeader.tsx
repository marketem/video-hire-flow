import { useSession } from "@supabase/auth-helpers-react";

export function DashboardHeader() {
  const session = useSession();

  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">
        Welcome, {session?.user.user_metadata.first_name || 'User'}!
      </h1>
      <p className="text-muted-foreground">
        {session?.user.user_metadata.trial_ends_at ? (
          `Trial ends in ${Math.ceil(
            (new Date(session.user.user_metadata.trial_ends_at).getTime() -
              Date.now()) /
              (1000 * 60 * 60 * 24)
          )} days`
        ) : 'Trial status not available'}
      </p>
    </div>
  );
}