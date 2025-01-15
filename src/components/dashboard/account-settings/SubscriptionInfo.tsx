import { useSession } from "@supabase/auth-helpers-react";

export function SubscriptionInfo() {
  const session = useSession();

  return (
    <div className="pt-4 space-y-2">
      <h4 className="text-sm font-medium">Subscription Information</h4>
      <p className="text-sm text-muted-foreground">
        {session?.user.user_metadata.trial_ends_at
          ? `Your trial ends on ${new Date(
              session.user.user_metadata.trial_ends_at
            ).toLocaleDateString()}`
          : "No active subscription"}
      </p>
    </div>
  );
}