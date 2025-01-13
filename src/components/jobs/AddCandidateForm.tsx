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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let resumeUrl = null
      
      // Upload resume if provided
      if (resume) {
        const fileExt = resume.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        console.log('Uploading file:', fileName)
        
        // First ensure the bucket exists and is properly configured
        const { data: bucketData, error: bucketError } = await supabase
          .storage
          .getBucket('resumes')
        
        if (bucketError) {
          console.error('Bucket error:', bucketError)
          throw new Error('Storage bucket not configured properly')
        }
        
        // Upload the file
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
        resumeUrl = fileName // Store just the filename
      }

      // Add candidate to database
      const { error } = await supabase
        .from('candidates')
        .insert([
          {
            job_id: jobId,
            name,
            email,
            phone,
            resume_url: resumeUrl,
            status: 'new'
          }
        ])

      if (error) throw error

      toast({
        title: "Success",
        description: "Candidate added successfully",
      })

      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })
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
          placeholder="+1234567890"
        />
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