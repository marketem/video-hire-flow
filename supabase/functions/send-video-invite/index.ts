import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailData {
  name: string
  senderName: string
  companyName: string
  submissionUrl: string
  email: string
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

    const emailData: EmailData = await req.json()
    console.log('Received email data:', emailData)

    const emailContent = {
      personalizations: [
        {
          to: [{ email: emailData.email }],
        },
      ],
      from: { email: 'info@videovibecheck.com' },
      subject: 'Video Introduction Request',
      content: [
        {
          type: 'text/html',
          value: `
            <h2>Video Introduction Request</h2>
            <p>Hello ${emailData.name},</p>
            <p>${emailData.senderName} from ${emailData.companyName} has requested that you submit a 30-second video introduction.</p>
            <p>Please click the link below to record and submit your video:</p>
            <p><a href="${emailData.submissionUrl}">Submit Your Video</a></p>
            <p>This link will expire in 24 hours for security purposes.</p>
          `,
        },
      ],
    }

    console.log('Sending email with payload:', emailContent)

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid API error:', errorText)
      throw new Error(`SendGrid API error: ${errorText}`)
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

serve(handler)