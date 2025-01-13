import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"

interface CreateJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface JobFormData {
  title: string
  department: string
  location: string
  description: string
  video_instructions: string
}

const DEFAULT_VIDEO_INSTRUCTIONS = "We're so excited to meet you! Please record a 30-second video introducing yourself."
const MAX_INSTRUCTIONS_LENGTH = 500

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useSupabaseClient()
  const user = useUser()
  const { toast } = useToast()
  const form = useForm<JobFormData>({
    defaultValues: {
      video_instructions: DEFAULT_VIDEO_INSTRUCTIONS
    }
  })

  const onSubmit = async (data: JobFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a job opening",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('job_openings')
        .insert([
          {
            title: data.title,
            department: data.department,
            location: data.location,
            description: data.description,
            video_instructions: data.video_instructions,
            status: 'open',
            user_id: user.id
          }
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Job opening created successfully",
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create job opening",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Job Opening</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior Software Engineer" {...field} />
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
                    <Input placeholder="e.g. Engineering" {...field} />
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
                    <Input placeholder="e.g. Remote, New York, NY" {...field} />
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
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter the job description..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="video_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter instructions for the video submission..."
                      className="min-h-[100px]"
                      maxLength={MAX_INSTRUCTIONS_LENGTH}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/{MAX_INSTRUCTIONS_LENGTH} characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Job Opening"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}