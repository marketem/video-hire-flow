import { useForm } from "react-hook-form"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useEffect } from "react"

interface EditJobDialogProps {
  job: {
    id: string
    title: string
    department: string
    location: string
    description: string
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
    },
  })

  // Reset form with new values when job changes or dialog opens
  useEffect(() => {
    if (job && open) {
      form.reset({
        title: job.title,
        department: job.department,
        location: job.location,
        description: job.description,
      })
    }
  }, [job, open, form])

  const onSubmit = async (values: {
    title: string
    department: string
    location: string
    description: string
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}