import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
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
    publicPageEnabled,
    setPublicPageEnabled,
    isLoading,
    handleSubmit,
  } = useJobForm(() => {
    console.log('Job created successfully, triggering refresh...')
    onJobCreated()
  })
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
        publicPageEnabled={publicPageEnabled}
        setPublicPageEnabled={setPublicPageEnabled}
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
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Create New Job Opening</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {content}
          </div>
        </SheetContent>
      </Sheet>
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