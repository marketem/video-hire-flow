import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

interface RequestBody {
  to: string
  name: string
  companyName: string
  senderName: string
  submissionUrl: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, name, companyName, senderName, submissionUrl } = await req.json() as RequestBody

    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error } = await supabaseClient.auth.admin.inviteUserByEmail(to, {
      data: {
        name,
        companyName,
        senderName,
        submissionUrl,
      },
      redirectTo: submissionUrl,
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})