import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

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
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Check if the number already has a country code
    if (cleaned.startsWith('1')) {
      return `+${cleaned}`
    }
    // Add +1 for US numbers if no country code
    return `+1${cleaned}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let resumeUrl = null
      
      // Format phone number before submission
      const formattedPhone = formatPhoneNumber(phone)
      
      if (resume) {
        const fileExt = resume.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        console.log('Uploading file:', fileName)
        
        const { data: bucketData, error: bucketError } = await supabase
          .storage
          .getBucket('resumes')
        
        if (bucketError) {
          console.error('Bucket error:', bucketError)
          throw new Error('Storage bucket not configured properly')
        }
        
        const { error: uploadError, data } = await supabase.storage
          .from('resumes')
          .upload(fileName, resume, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }
        
        console.log('Upload successful:', data)
        resumeUrl = fileName
      }

      console.log('Adding candidate to database:', { jobId, name, email, formattedPhone, resumeUrl })
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

      // Invalidate all relevant queries with correct query keys
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
          Enter phone number with country code (e.g., +1 for US numbers)
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
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Candidate"}
      </Button>
    </form>
  )
}
