import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"
import { formatPhoneNumber } from "@/utils/phoneUtils"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface AddCandidateFormProps {
  jobId: string
  onSuccess: () => void
}

interface FormValues {
  name: string
  email: string
  phone: string
  hasConsented: boolean
}

export function AddCandidateForm({ jobId, onSuccess }: AddCandidateFormProps) {
  const [resume, setResume] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      hasConsented: false
    }
  })

  const checkDuplicateEmail = async (email: string) => {
    try {
      console.log('Checking for duplicate email:', email, 'jobId:', jobId)
      const { data: existingCandidate, error } = await supabase
        .from('candidates')
        .select('id')
        .eq('job_id', jobId)
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (error) {
        console.error('Error checking for duplicate email:', error)
        throw error
      }

      console.log('Duplicate check result:', existingCandidate)
      return !!existingCandidate
    } catch (error) {
      console.error('Error in checkDuplicateEmail:', error)
      throw error
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!values.hasConsented) {
      toast({
        title: "Consent Required",
        description: "Please confirm that the candidate has provided consent to proceed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Check for duplicate email before proceeding with submission
      const isDuplicate = await checkDuplicateEmail(values.email)
      if (isDuplicate) {
        form.setError("email", {
          type: "manual",
          message: "A candidate with this email already exists for this job position. Please use a different email address."
        })
        setIsSubmitting(false)
        return
      }

      let resumeUrl = null
      
      if (resume) {
        const fileExt = resume.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('resumes')
          .upload(fileName, resume, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError
        resumeUrl = fileName
      }

      const formattedPhone = formatPhoneNumber(values.phone)

      const { error } = await supabase
        .from('candidates')
        .insert([
          {
            job_id: jobId,
            name: values.name,
            email: values.email.toLowerCase().trim(),
            phone: formattedPhone,
            resume_url: resumeUrl,
            status: 'new'
          }
        ])

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['job-candidates', jobId] })
      queryClient.invalidateQueries({ queryKey: ['video-stats'] })
      queryClient.invalidateQueries({ queryKey: ['job-openings'] })

      toast({
        title: "Success",
        description: "Candidate added successfully",
      })

      form.reset()
      setResume(null)
      onSuccess()
    } catch (error) {
      console.error('Form submission error:', error)
      // Only show generic error if it's not a validation error
      if (!form.getFieldState("email").error) {
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  {...field} 
                  required
                  className={fieldState.error ? "border-destructive ring-destructive" : ""} 
                />
              </FormControl>
              <FormMessage className="text-destructive font-medium" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (234) 567-8900"
                  {...field}
                  required
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Enter phone number in any format - we'll format it automatically
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="resume">Resume</Label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="resume" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/5 hover:bg-muted/10 border-muted-foreground/20">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground/75">PDF, DOC, or DOCX (Max 10MB)</p>
              </div>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>
          {resume && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected file: {resume.name}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="hasConsented"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-2 border rounded-lg p-4 bg-muted/5">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="grid gap-1.5 leading-none">
                <FormLabel>
                  Consent Confirmation
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  I confirm that the candidate has consented to receive SMS communications and agreed to VibeCheck's Terms of Service and Privacy Policy. Message and data rates may apply.
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Candidate"}
        </Button>
      </form>
    </Form>
  )
}
