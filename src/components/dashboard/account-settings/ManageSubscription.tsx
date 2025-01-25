import { useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ManageSubscription() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { data: { url }, error } = await supabase.functions.invoke('create-portal-session', {
        body: { returnUrl: window.location.origin + '/dashboard' }
      });

      if (error) throw error;
      if (url) window.location.href = url;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access subscription portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleManageSubscription} 
      variant="outline" 
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Manage Subscription'
      )}
    </Button>
  );
}