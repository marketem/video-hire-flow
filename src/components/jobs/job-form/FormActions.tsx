import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";

interface FormActionsProps {
  isLoading: boolean;
  onCancel: () => void;
  actionLabel: string;
}

export function FormActions({ isLoading, onCancel, actionLabel }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-2">
      <DialogClose asChild>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </DialogClose>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : actionLabel}
      </Button>
    </div>
  );
}