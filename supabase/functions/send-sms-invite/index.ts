import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SMSRequest {
  name: string
  phone: string
  companyName: string
  senderName: string
  submissionUrl: string
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting SMS invite handler')
    
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not found')
    }

    console.log('Parsing request body...')
    const requestData = await req.json() as SMSRequest
    
    // Validate request data
    if (!requestData.phone || !requestData.name || !requestData.submissionUrl) {
      const error = new Error('Missing required fields in request')
      console.error('Request validation failed:', error, 'Request data:', requestData)
      throw error
    }

    // Format phone number (ensure it starts with +)
    const formattedPhone = requestData.phone.startsWith('+') ? requestData.phone : `+${requestData.phone}`
    console.log('Formatted phone number:', formattedPhone)

    const message = `Hi ${requestData.name}, ${requestData.senderName} from ${requestData.companyName} has requested a video introduction. Please click this link to record and submit your video: ${requestData.submissionUrl}`

    const response = await fetch('https://api.sendgrid.com/v3/sms/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        content: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SendGrid API error:', errorText)
      throw new Error(`SendGrid API error: ${errorText}`)
    }

    const result = await response.json()
    console.log('SendGrid API Response:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: result.id,
        status: 'sent',
        error: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: {
          name: error.name
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

serve(handler)