import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { Settings, User, LogOut, BookOpen, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AccountSettingsDialog } from "./AccountSettingsDialog";
import { UserGuideDialog } from "./UserGuideDialog";
import { SupportDialog } from "./SupportDialog";
import { useQuery } from "@tanstack/react-query";

export function AccountMenu() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch user profile data including login count
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (!session?.user || !profile) return;

      // Show guide if this is their first login (login_count === 1)
      if (profile.login_count === 1) {
        console.log('First time user detected (login_count = 1), showing guide');
        // Small delay to ensure components are mounted
        setTimeout(() => {
          setShowGuide(true);
        }, 500);
      }
    };

    checkFirstTimeUser();
  }, [session, profile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account",
    });
    navigate("/login");
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session?.user.user_metadata.first_name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowGuide(true)}>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>User Guide</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSupport(true)}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AccountSettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings}
      />
      <UserGuideDialog
        open={showGuide}
        onOpenChange={setShowGuide}
      />
      <SupportDialog
        open={showSupport}
        onOpenChange={setShowSupport}
      />
    </>
  );
}