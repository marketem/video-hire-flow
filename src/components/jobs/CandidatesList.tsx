import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
  resume_url: string | null
}

interface CandidatesListProps {
  jobId: string
}

export function CandidatesList({ jobId }: CandidatesListProps) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Candidate[]
    },
  })

  const handleViewResume = async (resumeUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumeUrl, 60) // URL valid for 60 seconds

      if (error) throw error
      
      // Open resume in new tab
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to access resume",
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}