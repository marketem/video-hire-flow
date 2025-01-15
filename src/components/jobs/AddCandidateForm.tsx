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

interface AddCandidateFormProps {
  jobId: string
  onSuccess: () => void
}

export function AddCandidateForm({ jobId, onSuccess }: AddCandidateFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setResume(null)
    setHasConsented(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasConsented) {
      toast({
        title: "Consent Required",
        description: "Please confirm that the candidate has provided consent to proceed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
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

      const formattedPhone = formatPhoneNumber(phone)

      const { error } = await supabase
        .from('candidates')
        .insert([
          {
            job_id: jobId,
            name,
            email,
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

      resetForm()
      onSuccess()
    } catch (error) {
      console.error('Form submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add candidate",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+1 (234) 567-8900"
        />
        <p className="text-xs text-muted-foreground">
          Enter phone number in any format - we'll format it automatically
        </p>
      </div>
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

      <div className="flex items-start space-x-2 border rounded-lg p-4 bg-muted/5">
        <Checkbox 
          id="consent" 
          checked={hasConsented}
          onCheckedChange={(checked) => setHasConsented(checked as boolean)}
          className="mt-1"
        />
        <div className="grid gap-1.5 leading-none">
          <label
            htmlFor="consent"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Consent Confirmation
          </label>
          <p className="text-sm text-muted-foreground">
            I confirm that the candidate has consented to receive SMS communications and agreed to VibeCheck's Terms of Service and Privacy Policy. Message and data rates may apply.
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Candidate"}
      </Button>
    </form>
  )
}