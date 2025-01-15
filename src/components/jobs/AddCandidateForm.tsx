import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { formatPhoneNumber } from "@/utils/phoneUtils"
import { CandidateBasicInfo } from "./candidates/form/CandidateBasicInfo"
import { ResumeUpload } from "./candidates/form/ResumeUpload"
import { ConsentCheckbox } from "./candidates/form/ConsentCheckbox"

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
      <CandidateBasicInfo
        name={name}
        email={email}
        phone={phone}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
      />
      <ResumeUpload
        resume={resume}
        onResumeChange={setResume}
      />
      <ConsentCheckbox
        checked={hasConsented}
        onCheckedChange={setHasConsented}
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Candidate"}
      </Button>
    </form>
  )
}