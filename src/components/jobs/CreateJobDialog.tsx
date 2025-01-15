import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { JobFormFields } from "./job-form/JobFormFields"
import { FormActions } from "./job-form/FormActions"
import { useJobForm } from "@/hooks/useJobForm"

interface CreateJobDialogProps {
  onJobCreated: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateJobDialog({ onJobCreated, open, onOpenChange }: CreateJobDialogProps) {
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
  } = useJobForm(onJobCreated)
  const isMobile = useIsMobile()

  const content = (
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
        onCancel={() => onOpenChange(false)}
        actionLabel="Create Job"
      />
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create New Job Opening</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Job Opening</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}