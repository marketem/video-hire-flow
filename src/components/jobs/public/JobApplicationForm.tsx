import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface JobApplicationFormProps {
  jobId: string
}

export function JobApplicationForm({ jobId }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [smsConsent, setSmsConsent] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!smsConsent || !termsAccepted) {
      toast({
        title: "Required Consent",
        description: "Please accept both the terms and conditions and SMS consent to proceed.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log('Starting application submission for job:', jobId)
      
      if (resume && resume.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

      if (resume && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(resume.type)) {
        throw new Error("File must be PDF, DOC, or DOCX format")
      }

      let resumeUrl = null
      if (resume) {
        console.log('Uploading resume file')
        const fileExt = resume.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from('resumes')
          .upload(fileName, resume, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Resume upload error:', uploadError)
          throw new Error(uploadError.message || "Failed to upload resume")
        }
        resumeUrl = data.path
        console.log('Resume uploaded successfully:', resumeUrl)
      }

      const videoToken = crypto.randomUUID()
      
      console.log('Inserting candidate data:', {
        job_id: jobId,
        name,
        email,
        phone,
        resume_url: resumeUrl,
        video_token: videoToken
      })
      
      const { error: dbError } = await supabase
        .from('candidates')
        .insert([
          {
            job_id: jobId,
            name,
            email,
            phone,
            resume_url: resumeUrl,
            status: 'new',
            video_token: videoToken
          }
        ])

      if (dbError) {
        console.error('Database error:', dbError)
        throw new Error(dbError.message || "Failed to submit application")
      }

      console.log('Application submitted successfully')
      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      })

      // Reset form
      setName("")
      setEmail("")
      setPhone("")
      setResume(null)
      setSmsConsent(false)
      setTermsAccepted(false)
    } catch (error) {
      console.error('Application submission error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
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
          placeholder="+1234567890"
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

      <div className="space-y-4 border rounded-lg p-4 bg-muted/5">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept Terms and Conditions
            </label>
            <p className="text-sm text-muted-foreground">
              By checking this box, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox 
            id="sms" 
            checked={smsConsent}
            onCheckedChange={(checked) => setSmsConsent(checked as boolean)}
            className="mt-1"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="sms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              SMS Communication Consent
            </label>
            <p className="text-sm text-muted-foreground">
              I consent to receive SMS messages about my application status. Message and data rates may apply. Reply STOP to opt out.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  )
}