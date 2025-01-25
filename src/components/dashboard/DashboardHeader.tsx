import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { AccountMenu } from "./AccountMenu";
import { Button } from "@/components/ui/button";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { Sparkles } from "lucide-react";

export function DashboardHeader() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const hasPremiumAccess = usePremiumAccess();

  const handleUpgrade = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session')
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error starting subscription:', error)
    }
  }

  return (
    <div className="flex flex-col gap-2 mb-4 md:mb-8">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl md:text-3xl font-bold truncate pr-4">
            Welcome, {session?.user.user_metadata.first_name || 'User'}!
          </h1>
          {hasPremiumAccess ? (
            <p className="text-sm text-success">
              Premium
            </p>
          ) : session?.user.user_metadata.trial_ends_at ? (
            <p className="text-sm text-muted-foreground">
              Trial ends in {Math.ceil(
                (new Date(session.user.user_metadata.trial_ends_at).getTime() -
                  Date.now()) /
                  (1000 * 60 * 60 * 24)
              )} days
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          {!hasPremiumAccess && (
            <Button onClick={handleUpgrade} className="hidden sm:flex">
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now
            </Button>
          )}
          <AccountMenu />
        </div>
      </div>
    </div>
  );
}