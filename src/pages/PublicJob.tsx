import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { JobOpening } from "@/components/jobs/types"
import { JobDetails } from "@/components/jobs/public/JobDetails"

export default function PublicJob() {
  const { id } = useParams()
  const [job, setJob] = useState<JobOpening | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log('Fetching job with ID:', id)
        
        // Sign out any existing session to ensure we're accessing as public
        await supabase.auth.signOut()
        
        const { data, error } = await supabase
          .from('job_openings')
          .select('*')
          .eq('id', id)
          .maybeSingle()

        if (error) {
          console.error('Error fetching job:', error)
          throw error
        }

        if (!data) {
          throw new Error('Job not found')
        }

        if (data.status !== 'open' || !data.public_page_enabled) {
          throw new Error('This job posting is not available')
        }

        console.log('Fetched job data:', data)
        setJob(data)
      } catch (error) {
        console.error('Error in fetchJob:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "This job posting is not available",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [id, supabase, toast])

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
      <JobDetails job={job} />
    </div>
  )
}