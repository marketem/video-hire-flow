import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload } from "lucide-react"

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  description: string
  status: string
}

export default function PublicJob() {
  const { id } = useParams()
  const [job, setJob] = useState<JobOpening | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log('Fetching job with ID:', id)
        const { data, error } = await supabase
          .from('job_openings')
          .select('*')
          .eq('id', id)
          .eq('status', 'open')
          .single()

        if (error) {
          console.error('Error fetching job:', error)
          throw error
        }
        console.log('Fetched job data:', data)
        setJob(data)
      } catch (error) {
        console.error('Error in fetchJob:', error)
        toast({
          title: "Error",
          description: "This job posting is not available",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [id, supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log('Starting application submission for job:', id)
      
      // Validate file size (max 10MB)
      if (resume && resume.size > 10 * 1024 * 1024) {
        throw new Error("File size must be less than 10MB")
      }

      // Validate file type
      if (resume && !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(resume.type)) {
        throw new Error("File must be PDF, DOC, or DOCX format")
      }

      // Upload resume if provided
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

      // Add candidate to database
      console.log('Inserting candidate data:', {
        job_id: id,
        name,
        email,
        phone,
        resume_url: resumeUrl
      })
      
      const { error: dbError } = await supabase
        .from('candidates')
        .insert([
          {
            job_id: id,
            name,
            email,
            phone,
            resume_url: resumeUrl,
            status: 'new'
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Job Not Found</CardTitle>
            <CardDescription>This job posting is no longer available or has been closed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>
            {job.department} · {job.location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-semibold mb-2">About this role</h3>
            <div className="whitespace-pre-wrap">{job.description}</div>
          </div>

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
              <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1.5">
                <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>
                  By providing your phone number, you consent to receive SMS messages about your application status. Message and data rates may apply. Reply STOP to opt out.
                </p>
              </div>
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
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}