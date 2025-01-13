import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

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
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from('job_openings')
          .select('*')
          .eq('id', id)
          .eq('status', 'open')
          .single()

        if (error) throw error
        setJob(data)
      } catch (error) {
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
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-2">About this role</h3>
            <div className="whitespace-pre-wrap">{job.description}</div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full">
            Apply Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}