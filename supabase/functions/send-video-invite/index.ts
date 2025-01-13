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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth token from request header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Parse request body
    const body = await req.json() as RequestBody
    const { to, name, companyName, senderName, submissionUrl } = body

    // Validate required fields
    if (!to || !submissionUrl) {
      throw new Error('Missing required fields')
    }

    // Create Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Send email using a basic email template
    const { error } = await supabaseAdmin.auth.admin.sendEmail(to, {
      template: 'custom',
      subject: 'Video Interview Request',
      html: `
        <h2>Hello ${name},</h2>
        <p>${senderName} from ${companyName} has requested a video interview submission from you.</p>
        <p>Please click the link below to record and submit your video:</p>
        <p><a href="${submissionUrl}">${submissionUrl}</a></p>
        <p>Best regards,<br>${companyName} Team</p>
      `
    })

    if (error) {
      console.error('Error sending email:', error)
      throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})