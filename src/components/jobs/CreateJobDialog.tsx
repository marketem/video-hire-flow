import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { JobFormFields } from "./job-form/JobFormFields";
import { FormActions } from "./job-form/FormActions";
import { useJobForm } from "@/hooks/useJobForm";

interface CreateJobDialogProps {
  onJobCreated: () => void;
}

export function CreateJobDialog({ onJobCreated }: CreateJobDialogProps) {
  const {
    title,
    setTitle,
    department,
    setDepartment,
    location,
    setLocation,
    description,
    setDescription,
    isLoading,
    handleSubmit,
  } = useJobForm(onJobCreated);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Create Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Job Opening</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <JobFormFields
            title={title}
            setTitle={setTitle}
            department={department}
            setDepartment={setDepartment}
            location={location}
            setLocation={setLocation}
            description={description}
            setDescription={setDescription}
          />
          <FormActions
            isLoading={isLoading}
            onCancel={() => {}}
            actionLabel="Create Job"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}