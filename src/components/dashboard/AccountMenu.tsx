import { useState } from "react";
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

export function AccountMenu() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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