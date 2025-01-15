import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { AccountSettingsForm } from "./account-settings/AccountSettingsForm";
import { SubscriptionInfo } from "./account-settings/SubscriptionInfo";

interface AccountSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountSettingsDialog({ open, onOpenChange }: AccountSettingsDialogProps) {
  const isMobile = useIsMobile();

  const content = (
    <div className="space-y-4">
      <AccountSettingsForm onSuccess={() => onOpenChange(false)} />
      <SubscriptionInfo />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Account Settings</SheetTitle>
            <SheetDescription>
              Update your account information and manage your subscription.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Update your account information and manage your subscription.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}