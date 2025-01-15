import { Button } from "@/components/ui/button"
import { FileText, Video, Copy } from "lucide-react"
import { useCandidateActions } from "@/hooks/useCandidateActions"

interface ResumeActionProps {
  url: string | null
  jobId: string
}

interface VideoActionProps {
  url: string | null
  jobId: string
}

interface CopyLinkActionProps {
  candidateId: string
  jobId: string
}

function ResumeAction({ url, jobId }: ResumeActionProps) {
  const { handleViewResume } = useCandidateActions(jobId)
  
  if (!url) {
    return <span className="text-muted-foreground text-sm">No resume</span>
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => handleViewResume(url)}
      title="View Resume"
    >
      <FileText className="h-4 w-4" />
    </Button>
  )
}

function VideoAction({ url, jobId }: VideoActionProps) {
  if (!url) {
    return <span className="text-muted-foreground text-sm">No video</span>
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {/* TODO: Implement video viewing */}}
      title="View Video"
    >
      <Video className="h-4 w-4" />
    </Button>
  )
}

function CopyLinkAction({ candidateId, jobId }: CopyLinkActionProps) {
  const { copyVideoLink } = useCandidateActions(jobId)
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => copyVideoLink(candidateId)}
      title="Copy video submission link"
    >
      <Copy className="h-4 w-4" />
    </Button>
  )
}

export const CandidateActions = {
  Resume: ResumeAction,
  Video: VideoAction,
  CopyLink: CopyLinkAction,
}