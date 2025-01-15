import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { useToast } from "@/hooks/use-toast"

interface UserSettings {
  first_name: string
  last_name: string
  company_name: string
  email: string
}

export function useUserSettings() {
  const session = useSession()
  const supabase = useSupabaseClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const settings = useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      if (!session?.user) throw new Error('No user session')

      return {
        first_name: session.user.user_metadata.first_name || '',
        last_name: session.user.user_metadata.last_name || '',
        company_name: session.user.user_metadata.company_name || '',
        email: session.user.email || '',
      } as UserSettings
    },
    enabled: !!session?.user
  })

  const updateSettings = useMutation({
    mutationFn: async (updates: UserSettings) => {
      // Update user metadata (first name, last name, company name)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          first_name: updates.first_name,
          last_name: updates.last_name,
          company_name: updates.company_name,
        },
      })

      if (metadataError) throw metadataError

      // Update email if it has changed
      if (updates.email !== session?.user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email,
        })

        if (emailError) throw emailError
      }

      return updates
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-settings'], data)
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      })
    }
  })

  return {
    settings: settings.data,
    isLoading: settings.isLoading,
    error: settings.error,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  }
}