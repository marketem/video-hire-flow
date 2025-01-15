import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"
import type { JobOpening } from "@/components/jobs/types"

export function useJobs() {
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const jobs = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      console.log('Fetching jobs')
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching jobs:', error)
        throw error
      }

      return data as JobOpening[]
    }
  })

  const createJob = useMutation({
    mutationFn: async (newJob: Omit<JobOpening, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('job_openings')
        .insert([newJob])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast({
        title: "Success",
        description: "Job opening created successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create job opening",
        variant: "destructive",
      })
    }
  })

  const updateJob = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobOpening> & { id: string }) => {
      const { data, error } = await supabase
        .from('job_openings')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      toast({
        title: "Success",
        description: "Job opening updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update job opening",
        variant: "destructive",
      })
    }
  })

  return {
    jobs: jobs.data ?? [],
    isLoading: jobs.isLoading,
    error: jobs.error,
    createJob: createJob.mutate,
    updateJob: updateJob.mutate,
    isCreating: createJob.isPending,
    isUpdating: updateJob.isPending,
  }
}