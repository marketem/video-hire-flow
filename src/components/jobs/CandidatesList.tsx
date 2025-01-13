import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Video, Send, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
  resume_url: string | null
  video_url: string | null
  video_token?: string | null
}

interface CandidatesListProps {
  jobId: string
}

export function CandidatesList({ jobId }: CandidatesListProps) {
  const supabase = useSupabaseClient()
  const { toast } = useToast()
  const user = useUser()
  const queryClient = useQueryClient()
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])

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

  const generateTokenMutation = useMutation({
    mutationFn: async (candidateId: string) => {
      const token = crypto.randomUUID()
      
      const { error } = await supabase
        .from('candidates')
        .update({ video_token: token })
        .eq('id', candidateId)

      if (error) throw error
      return { candidateId, token }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })
    },
  })

  const handleViewResume = async (resumeUrl: string) => {
    try {
      console.log('Attempting to access resume:', resumeUrl)
      
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

  const sendVideoInvites = async () => {
    try {
      const selectedCandidatesList = candidates?.filter(c => 
        selectedCandidates.includes(c.id)
      ) || []

      for (const candidate of selectedCandidatesList) {
        if (!candidate.video_token) {
          await generateTokenMutation.mutateAsync(candidate.id)
        }
        
        const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${candidate.video_token}`
        const message = `${user?.user_metadata?.name || 'The hiring manager'} has invited you to submit a quick video to finish your application to ${user?.user_metadata?.company_name || 'our company'}: ${videoSubmissionUrl}`

        console.log('SMS message:', message)
        console.log('Would be sent to:', candidate.phone)
      }

      toast({
        title: "Success",
        description: `Video invites sent to ${selectedCandidatesList.length} candidates`,
      })

      setSelectedCandidates([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send video invitations",
        variant: "destructive",
      })
    }
  }

  const copyVideoLink = async (candidateId: string) => {
    try {
      console.log('Starting copyVideoLink for candidate:', candidateId);
      
      const candidate = candidates?.find(c => c.id === candidateId);
      console.log('Found candidate:', candidate);
      
      if (!candidate) {
        throw new Error('Candidate not found');
      }

      if (!candidate.video_token) {
        console.log('No video token found, generating new one');
        await generateTokenMutation.mutateAsync(candidateId);
      }
      
      const updatedCandidate = await queryClient.fetchQuery<Candidate>({
        queryKey: ['candidates', jobId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('candidates')
            .select('*')
            .eq('id', candidateId)
            .single();

          if (error) {
            console.error('Error fetching updated candidate:', error);
            throw error;
          }
          return data as Candidate;
        }
      });

      console.log('Updated candidate data:', updatedCandidate);

      if (!updatedCandidate?.video_token) {
        console.error('No video token found after generation');
        throw new Error('Failed to generate or retrieve video token');
      }

      const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${updatedCandidate.video_token}`;
      console.log('Generated URL:', videoSubmissionUrl);

      const textarea = document.createElement('textarea');
      textarea.value = videoSubmissionUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.top = '0';
      textarea.style.left = '0';
      
      document.body.appendChild(textarea);
      
      let copySuccess = false;
      
      try {
        await navigator.clipboard.writeText(videoSubmissionUrl);
        console.log('Successfully copied using Clipboard API');
        copySuccess = true;
      } catch (clipboardError) {
        console.log('Clipboard API failed, falling back to selection method', clipboardError);
        
        textarea.focus();
        textarea.select();
        
        try {
          copySuccess = document.execCommand('copy');
          if (!copySuccess) {
            console.error('execCommand copy failed');
          } else {
            console.log('Successfully copied using execCommand');
          }
        } catch (execError) {
          console.error('Error using execCommand:', execError);
        }
      } finally {
        document.body.removeChild(textarea);
      }

      if (copySuccess) {
        toast({
          title: "Success",
          description: "Video submission link copied to clipboard",
        });
      } else {
        throw new Error('Failed to copy to clipboard');
      }
      
    } catch (error) {
      console.error('Error in copyVideoLink:', error);
      
      const currentToken = candidates?.find(c => c.id === candidateId)?.video_token;
      const fallbackUrl = currentToken 
        ? `${window.location.origin}/video-submission?token=${currentToken}`
        : 'No video token available';
      
      toast({
        title: "Error",
        description: `Failed to copy link. URL: ${fallbackUrl}`,
        variant: "destructive",
      });
      
      return false;
    }
    
    return true;
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(candidates?.map(c => c.id) || [])
    } else {
      setSelectedCandidates([])
    }
  }

  const toggleCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates(prev => [...prev, candidateId])
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId))
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
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        {selectedCandidates.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {selectedCandidates.length} candidates selected
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          <Button
            size="sm"
            onClick={sendVideoInvites}
            disabled={selectedCandidates.length === 0}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Video Invites
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedCandidates.length === candidates.length}
                onCheckedChange={(checked) => toggleSelectAll(checked as boolean)}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Video</TableHead>
            <TableHead>Invite</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates?.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedCandidates.includes(candidate.id)}
                  onCheckedChange={(checked) => toggleCandidate(candidate.id, checked as boolean)}
                />
              </TableCell>
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
                  <span className="text-muted-foreground text-sm">No video</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyVideoLink(candidate.id)}
                  title="Copy video submission link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
