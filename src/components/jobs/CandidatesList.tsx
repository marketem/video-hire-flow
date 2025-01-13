import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
  resume_url: string | null
  video_url: string | null
}

interface CandidatesListProps {
  jobId: string
}

export function CandidatesList({ jobId }: CandidatesListProps) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const user = useUser()

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      if (!jobId) return []
      
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Candidate[]
    },
    enabled: !!jobId,
  })

  const handleViewResume = async (resumeUrl: string) => {
    try {
      console.log('Attempting to access resume:', resumeUrl)
      
      // Create signed URL directly without checking bucket
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumeUrl, 60)

      if (error) {
        console.error('Signed URL error:', error)
        throw error
      }
      
      if (!data?.signedUrl) {
        throw new Error('Failed to generate signed URL')
      }

      console.log('Successfully generated signed URL')
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Error accessing resume:', error)
      let errorMessage = 'Failed to access resume'
      
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const sendVideoInvite = async (candidate: Candidate) => {
    try {
      const videoSubmissionUrl = `${window.location.origin}/video-submission/${candidate.id}`
      const message = `${user?.user_metadata?.name || 'The hiring manager'} has invited you to submit a quick video to finish your application to ${user?.user_metadata?.company_name || 'our company'}: ${videoSubmissionUrl}`

      // Here we would integrate with an SMS service
      // For now, we'll just show a toast with the message
      toast({
        title: "Demo Mode",
        description: "In a production environment, this would send an SMS to the candidate with the video submission link.",
      })
      console.log('SMS message:', message)
      console.log('Would be sent to:', candidate.phone)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send video invitation",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading candidates...</div>
  }

  if (!candidates?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No candidates yet. Add candidates manually or upload a CSV file.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead>Resume</TableHead>
          <TableHead>Video</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates?.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell className="font-medium">{candidate.name}</TableCell>
            <TableCell>{candidate.email}</TableCell>
            <TableCell>{candidate.phone}</TableCell>
            <TableCell>
              <span 
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  candidate.status === 'new' 
                    ? 'ring-blue-600/20 bg-blue-50 text-blue-700'
                    : candidate.status === 'reviewing'
                    ? 'ring-yellow-600/20 bg-yellow-50 text-yellow-700'
                    : candidate.status === 'accepted'
                    ? 'ring-green-600/20 bg-green-50 text-green-700'
                    : 'ring-red-600/20 bg-red-50 text-red-700'
                }`}
              >
                {candidate.status}
              </span>
            </TableCell>
            <TableCell>{new Date(candidate.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              {candidate.resume_url ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleViewResume(candidate.resume_url!)}
                  title="View Resume"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              ) : (
                <span className="text-muted-foreground text-sm">No resume</span>
              )}
            </TableCell>
            <TableCell>
              {candidate.video_url ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {/* TODO: Implement video viewing */}}
                  title="View Video"
                >
                  <Video className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendVideoInvite(candidate)}
                >
                  Request Video
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}