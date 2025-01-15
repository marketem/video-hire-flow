import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import type { Candidate } from "@/types/candidate"

export function useCandidates(jobId: string) {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const candidates = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: async () => {
      console.log('Fetching candidates for job:', jobId)
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching candidates:', error)
        throw error
      }

      return data as Candidate[]
    },
    enabled: !!jobId
  })

  const updateCandidate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Candidate> & { id: string }) => {
      const { data, error } = await supabase
        .from('candidates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })
      toast({
        title: "Success",
        description: "Candidate updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update candidate",
        variant: "destructive",
      })
    }
  })

  const deleteCandidates = useMutation({
    mutationFn: async (candidateIds: string[]) => {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .in('id', candidateIds)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', jobId] })
      toast({
        title: "Success",
        description: "Candidates deleted successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete candidates",
        variant: "destructive",
      })
    }
  })

  return {
    candidates: candidates.data ?? [],
    isLoading: candidates.isLoading,
    error: candidates.error,
    updateCandidate: updateCandidate.mutate,
    deleteCandidates: deleteCandidates.mutate,
    isUpdating: updateCandidate.isPending,
    isDeleting: deleteCandidates.isPending,
  }
}