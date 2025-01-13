import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { Bold, Italic, List } from "lucide-react"

interface CreateJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface JobFormData {
  title: string
  department: string
  location: string
  description: string
  public_page_enabled: boolean
}

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useSupabaseClient()
  const user = useUser()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const form = useForm<JobFormData>({
    defaultValues: {
      public_page_enabled: true
    }
  })

  const insertFormatting = (tag: string) => {
    const textarea = document.getElementById('description') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)
    
    let newText = ''
    if (tag === 'list') {
      newText = `\n• ${selectedText}`
    } else {
      newText = `<${tag}>${selectedText}</${tag}>`
    }
    
    const newValue = text.substring(0, start) + newText + text.substring(end)
    form.setValue('description', newValue)
    
    // Restore focus and selection
    textarea.focus()
    textarea.setSelectionRange(start + newText.length, start + newText.length)
  }

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
            public_page_enabled: data.public_page_enabled,
            status: 'open',
            user_id: user.id
          }
        ])

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['job-openings'] })
      queryClient.invalidateQueries({ queryKey: ['video-stats'] })

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
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertFormatting('b')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertFormatting('i')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertFormatting('list')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        id="description"
                        placeholder="Enter the job description..."
                        className="min-h-[200px] font-mono"
                        {...field} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="public_page_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable public application page</FormLabel>
                  </div>
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