import { Button } from "@/components/ui/button"
import { FileText, Video, Copy } from "lucide-react"
import { useCandidateActions } from "@/hooks/useCandidateActions"

interface ResumeActionProps {
  url: string | null
}

interface VideoActionProps {
  url: string | null
}

interface CopyLinkActionProps {
  candidateId: string
}

function ResumeAction({ url }: ResumeActionProps) {
  const { handleViewResume } = useCandidateActions()
  
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

function VideoAction({ url }: VideoActionProps) {
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

function CopyLinkAction({ candidateId }: CopyLinkActionProps) {
  const { copyVideoLink } = useCandidateActions()
  
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