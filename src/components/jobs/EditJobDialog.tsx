import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Form } from "@/components/ui/form"
import { useEffect } from "react"
import { JobFormFields } from "./job-form/JobFormFields"
import { FormActions } from "./job-form/FormActions"
import { useEditJobForm } from "@/hooks/useEditJobForm"
import type { JobOpening } from "./types"

interface EditJobDialogProps {
  job: JobOpening | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobUpdated: () => void
}

export function EditJobDialog({ 
  job, 
  open, 
  onOpenChange,
  onJobUpdated 
}: EditJobDialogProps) {
  const {
    form,
    resetForm,
    onSubmit,
    isSubmitting
  } = useEditJobForm(job, onJobUpdated, () => onOpenChange(false))
  const isMobile = useIsMobile()

  useEffect(() => {
    if (job && open) {
      resetForm()
    }
  }, [job, open, resetForm])

  if (!job) return null

  const content = (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <JobFormFields
          title={form.watch("title")}
          setTitle={(value) => form.setValue("title", value)}
          department={form.watch("department")}
          setDepartment={(value) => form.setValue("department", value)}
          location={form.watch("location")}
          setLocation={(value) => form.setValue("location", value)}
          description={form.watch("description")}
          setDescription={(value) => form.setValue("description", value)}
          publicPageEnabled={form.watch("public_page_enabled")}
          setPublicPageEnabled={(value) => form.setValue("public_page_enabled", value)}
        />
        <FormActions
          isLoading={isSubmitting}
          onCancel={() => onOpenChange(false)}
          actionLabel="Save Changes"
        />
      </form>
    </Form>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Job Opening</SheetTitle>
            <SheetDescription>
              Make changes to the job opening details below.
            </SheetDescription>
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
          <DialogTitle>Edit Job Opening</DialogTitle>
          <DialogDescription>
            Make changes to the job opening details below.
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}