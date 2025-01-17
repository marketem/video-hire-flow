import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateJobDialog } from "./CreateJobDialog";
import { JobOpeningsList } from "./JobOpeningsList";

export function JobOpenings() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Job Openings</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>
      <JobOpeningsList />
      <CreateJobDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}