import { useForm } from "react-hook-form"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"
import { JobFormFields } from "./job-form/JobFormFields"
import { FormActions } from "./job-form/FormActions"

interface EditJobDialogProps {
  job: {
    id: string
    title: string
    department: string
    location: string
    description: string
    public_page_enabled: boolean
  } | null
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
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  
  const form = useForm({
    defaultValues: {
      title: "",
      department: "",
      location: "",
      description: "",
      public_page_enabled: true,
    },
  })

  useEffect(() => {
    if (job && open) {
      form.reset({
        title: job.title,
        department: job.department,
        location: job.location,
        description: job.description,
        public_page_enabled: job.public_page_enabled,
      })
    }
  }, [job, open, form])

  const onSubmit = async (values: {
    title: string
    department: string
    location: string
    description: string
    public_page_enabled: boolean
  }) => {
    if (!job) return

    try {
      const { error } = await supabase
        .from('job_openings')
        .update(values)
        .eq('id', job.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Job opening updated successfully",
      })
      
      onJobUpdated()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job opening",
        variant: "destructive",
      })
    }
  }

  if (!job) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Job Opening</DialogTitle>
          <DialogDescription>
            Make changes to the job opening details below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <JobFormFields
              title={form.watch("title")}
              setTitle={(value) => form.setValue("title", value)}
              department={form.watch("department")}
              setDepartment={(value) => form.setValue("department", value)}
              location={form.watch("location")}
              setLocation={(value) => form.setValue("location", value)}
              description={form.watch("description")}
              setDescription={(value) => form.setValue("description", value)}
            />
            <FormActions
              isLoading={form.formState.isSubmitting}
              onCancel={() => onOpenChange(false)}
              actionLabel="Save Changes"
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}