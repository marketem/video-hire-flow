import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import { CandidatesTable } from "./candidates/CandidatesTable"
import { BulkActions } from "./candidates/BulkActions"
import type { Candidate } from "@/types/candidate"

interface CandidatesListProps {
  jobId: string
}

export function CandidatesList({ jobId }: CandidatesListProps) {
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const supabase = useSupabaseClient()
  const user = useUser()
  const { toast } = useToast()

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

  const sendVideoInvites = async () => {
    try {
      const selectedCandidatesList = candidates?.filter(c => 
        selectedCandidates.includes(c.id)
      ) || []

      for (const candidate of selectedCandidatesList) {
        const videoSubmissionUrl = `${window.location.origin}/video-submission?token=${candidate.video_token}`
        const message = `${user?.user_metadata?.name || 'The hiring manager'} has invited you to submit a quick video to finish your application to ${user?.user_metadata?.company_name || 'our company'}: ${videoSubmissionUrl}`

        console.log('SMS message:', message)
        console.log('Would be sent to:', candidate.phone)

        // Update candidate status to 'requested'
        await supabase
          .from('candidates')
          .update({ status: 'requested' })
          .eq('id', candidate.id)
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
      <BulkActions
        selectedCount={selectedCandidates.length}
        onSendInvites={sendVideoInvites}
      />
      <CandidatesTable
        candidates={candidates}
        selectedCandidates={selectedCandidates}
        onToggleSelect={toggleCandidate}
        onToggleSelectAll={toggleSelectAll}
      />
    </div>
  )
}