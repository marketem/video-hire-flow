import { useSession } from "@supabase/auth-helpers-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"

export function usePremiumAccess() {
  const session = useSession()

  const { data: hasPremiumAccess = false } = useQuery({
    queryKey: ['premium-access', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false
      
      // First check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('has_premium_access')
        .eq('id', session.user.id)
        .maybeSingle() // Use maybeSingle instead of single to handle missing profiles

      // If no profile exists, create one
      if (!profile && !profileError) {
        console.log('No profile found, creating one...')
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ 
            id: session.user.id,
            has_premium_access: false,
            login_count: 1,
            last_login: new Date().toISOString()
          }])
          .select('has_premium_access')
          .maybeSingle()

        if (insertError) {
          console.error('Error creating profile:', insertError)
          return false
        }

        return newProfile?.has_premium_access ?? false
      }

      if (profileError) {
        console.error('Error fetching premium access:', profileError)
        return false
      }

      return profile?.has_premium_access ?? false
    },
    enabled: !!session?.user?.id
  })

  return hasPremiumAccess
}