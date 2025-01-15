import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import axiod from "https://deno.land/x/axiod@0.26.2/mod.ts"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const TINYURL_API_KEY = Deno.env.get('TINYURL_API_KEY')

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

async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const response = await axiod.post('https://api.tinyurl.com/create', {
      url: longUrl,
      domain: "tinyurl.com"
    }, {
      headers: {
        'Authorization': `Bearer ${TINYURL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data.tiny_url;
  } catch (error) {
    console.error('URL shortening failed:', error);
    return longUrl; // Fallback to original URL if shortening fails
  }
}

const handler = async (req: Request): Promise<Response> => {
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
    
    if (!requestData.phone || !requestData.name || !requestData.submissionUrl) {
      const error = new Error('Missing required fields in request')
      console.error('Request validation failed:', error, 'Request data:', requestData)
      throw error
    }

    // Shorten the URL before sending
    const shortUrl = await shortenUrl(requestData.submissionUrl)
    console.log('Shortened URL:', shortUrl)

    const formattedPhone = requestData.phone.startsWith('+') ? requestData.phone : `+${requestData.phone}`
    console.log('Formatted phone number:', formattedPhone)

    const message = `Hi ${requestData.name}, ${requestData.senderName} from ${requestData.companyName} has requested a video introduction. Record here: ${shortUrl}`

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