import { useSession } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function usePremiumAccess() {
  const session = useSession()

  const { data: hasPremiumAccess = false } = useQuery({
    queryKey: ['premium-access', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false
      
      const { data, error } = await supabase
        .from('profiles')
        .select('has_premium_access')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching premium access:', error)
        return false
      }

      return data?.has_premium_access ?? false
    },
    enabled: !!session?.user?.id
  })

  return hasPremiumAccess
}