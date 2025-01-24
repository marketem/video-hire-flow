import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  candidateName: string
  jobTitle: string
  dashboardUrl: string
  type?: 'video_submission' | 'status_change'
  newStatus?: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not found')
    }

    const { to, candidateName, jobTitle, dashboardUrl, type = 'video_submission', newStatus } = await req.json() as EmailRequest

    console.log('Sending email notification:', { to, candidateName, jobTitle, type, newStatus })

    let subject = ''
    let content = ''

    if (type === 'video_submission') {
      subject = 'New Candidate Video Ready for Review'
      content = `
        <h2>New Video Submission Ready</h2>
        <p>A new video submission is ready for your review!</p>
        <p><strong>Candidate:</strong> ${candidateName}<br>
        <strong>Job Position:</strong> ${jobTitle}</p>
        <p>You can review their video submission now in your <a href="${dashboardUrl}">dashboard</a>.</p>
        <p>Best regards,<br>VibeCheck Team</p>
      `
    } else if (type === 'status_change' && newStatus) {
      subject = `Candidate Status Updated: ${newStatus}`
      content = `
        <h2>Candidate Status Update</h2>
        <p>A candidate's status has been updated:</p>
        <p><strong>Candidate:</strong> ${candidateName}<br>
        <strong>Job Position:</strong> ${jobTitle}<br>
        <strong>New Status:</strong> ${newStatus}</p>
        <p>You can view the details in your <a href="${dashboardUrl}">dashboard</a>.</p>
        <p>Best regards,<br>VibeCheck Team</p>
      `
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
        }],
        from: { email: 'info@videovibecheck.com', name: 'VibeCheck' },
        subject,
        content: [{
          type: 'text/html',
          value: content
        }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid API error:', error)
      throw new Error(`SendGrid API error: ${error}`)
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

serve(handler)