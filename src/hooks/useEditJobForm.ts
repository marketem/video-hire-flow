import { useForm } from "react-hook-form"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import type { JobOpening } from "@/components/jobs/types"

interface EditJobFormData {
  title: string
  department: string
  location: string
  description: string
  public_page_enabled: boolean
}

export function useEditJobForm(
  job: JobOpening | null,
  onSuccess: () => void,
  onClose: () => void
) {
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  
  const form = useForm<EditJobFormData>({
    defaultValues: {
      title: "",
      department: "",
      location: "",
      description: "",
      public_page_enabled: true,
    },
  })

  const resetForm = () => {
    if (job) {
      form.reset({
        title: job.title,
        department: job.department,
        location: job.location,
        description: job.description,
        public_page_enabled: job.public_page_enabled,
      })
    }
  }

  const onSubmit = async (values: EditJobFormData) => {
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
      
      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job opening",
        variant: "destructive",
      })
    }
  }

  return {
    form,
    resetForm,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  }
}