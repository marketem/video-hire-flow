import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Check, X, PhoneCall, Play } from "lucide-react"
import { type Candidate } from "@/types/candidate"

interface VideoSubmissionCardProps {
  submission: Candidate & { job_openings: { title: string } }
}

export function VideoSubmissionCard({ submission }: VideoSubmissionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const updateStatusMutation = useMutation({
    mutationFn: async ({ candidateId, status }: { candidateId: string, status: string }) => {
      const { error } = await supabase
        .from('candidates')
        .update({ status })
        .eq('id', candidateId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-submissions'] })
      toast({
        title: "Success",
        description: "Candidate status updated",
      })
    },
  })

  const handlePlayVideo = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(submission.video_url!, 3600)

      if (error) throw error
      
      setIsPlaying(true)
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to play video",
        variant: "destructive",
      })
    }
  }

  const handleCall = () => {
    window.location.href = `tel:${submission.phone}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <div>{submission.name}</div>
            <div className="text-sm text-muted-foreground">{submission.job_openings.title}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <div>Email: {submission.email}</div>
          <div>Phone: {submission.phone}</div>
          <div>Submitted: {new Date(submission.created_at).toLocaleDateString()}</div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePlayVideo}
            disabled={isPlaying}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCall}
          >
            <PhoneCall className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateStatusMutation.mutate({ 
              candidateId: submission.id, 
              status: "reviewing" 
            })}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateStatusMutation.mutate({ 
              candidateId: submission.id, 
              status: "rejected" 
            })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}