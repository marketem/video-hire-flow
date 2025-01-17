import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  candidateId: string
  candidateName: string
  candidateEmail: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log('Starting send-video-notification function')
    
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not found')
      throw new Error('SendGrid API key not found')
    }

    const payload: NotificationPayload = await req.json()
    console.log('Received payload:', {
      candidateId: payload.candidateId,
      candidateName: payload.candidateName
    })

    // Prepare email data
    const emailData = {
      personalizations: [
        {
          to: [{ email: payload.candidateEmail }],
        },
      ],
      from: { email: 'info@videovibecheck.com', name: 'Video Vibe Check' },
      subject: 'Video Submission Received',
      content: [
        {
          type: 'text/html',
          value: `
            <h2>Thank You for Your Video Submission</h2>
            <p>Hello ${payload.candidateName},</p>
            <p>We have received your video submission. Our team will review it shortly.</p>
            <p>Thank you for taking the time to complete this step in the application process.</p>
          `,
        },
      ],
    }

    console.log('Sending email via SendGrid...')

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    console.log('SendGrid response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`)
    }

    console.log('Email sent successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email sent successfully'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in send-video-notification function:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: {
          name: error.name,
          type: error.constructor.name
        }
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 500,
      },
    )
  }
}

serve(handler)