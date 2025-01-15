import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Twilio } from 'npm:twilio'

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
    
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Missing Twilio credentials')
      throw new Error('Missing Twilio credentials')
    }

    const { name, phone, companyName, senderName, submissionUrl } = await req.json() as SMSRequest
    console.log('Received request data:', { name, phone, companyName, senderName })

    const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    const message = `Hi ${name}, ${senderName} from ${companyName} has requested a video introduction. Please click this link to record and submit your video: ${submissionUrl}`

    console.log('Sending SMS with message:', message)
    console.log('To phone number:', phone)
    console.log('From phone number:', TWILIO_PHONE_NUMBER)

    const result = await client.messages.create({
      body: message,
      to: phone,
      from: TWILIO_PHONE_NUMBER
    })

    console.log('SMS sent successfully:', result.sid)

    return new Response(
      JSON.stringify({ success: true, messageId: result.sid }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in send-sms-invite function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
}

serve(handler)