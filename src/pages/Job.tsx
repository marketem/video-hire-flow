import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Globe, MapPin, Building2 } from "lucide-react"

interface JobOpening {
  id: string
  title: string
  department: string
  location: string
  status: string
  description: string
  created_at: string
}

export default function Job() {
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
          .single()

        if (error) throw error
        
        if (!data) {
          toast({
            title: "Not Found",
            description: "This job opening doesn't exist or has been removed.",
            variant: "destructive",
          })
          return
        }

        if (data.status !== 'open') {
          toast({
            title: "Job Closed",
            description: "This position is no longer accepting applications.",
            variant: "destructive",
          })
        }

        setJob(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load job details",
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
      <div className="container mx-auto px-4 py-8">
        Loading...
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        Job not found
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-2">{job.title}</CardTitle>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {job.department}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {job.status === 'open' ? 'Active' : 'Closed'}
                </div>
              </div>
            </div>
            <Button 
              size="lg"
              disabled={job.status !== 'open'}
            >
              Apply Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none">
            <h3 className="text-lg font-semibold mb-2">About this role</h3>
            <div className="whitespace-pre-wrap">{job.description}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}