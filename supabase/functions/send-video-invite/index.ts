import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

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

    const emailContent = {
      personalizations: [{
        to: [{ email: to, name }],
        subject: `Video Interview Request from ${companyName}`,
      }],
      content: [{
        type: 'text/html',
        value: `
          <p>Hello ${name},</p>
          <p>${senderName} from ${companyName} has invited you to submit a quick video interview.</p>
          <p>Please click the link below to record and submit your video:</p>
          <p><a href="${submissionUrl}">${submissionUrl}</a></p>
          <p>Best regards,<br>${companyName} Hiring Team</p>
        `
      }],
      from: { email: 'no-reply@yourdomain.com', name: `${companyName} Hiring` },
      reply_to: { email: 'no-reply@yourdomain.com', name: `${companyName} Hiring` }
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})