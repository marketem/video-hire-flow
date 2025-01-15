import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import twilio from 'npm:twilio'

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

    console.log('Validating Twilio credentials...')
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      const error = new Error('Missing Twilio credentials')
      console.error('Credential validation failed:', error)
      throw error
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

    console.log('Initializing Twilio client...')
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

    console.log('Preparing to send SMS with:', {
      to: formattedPhone,
      from: TWILIO_PHONE_NUMBER,
      messageLength: message.length
    })

    try {
      const result = await client.messages.create({
        body: message,
        to: formattedPhone,
        from: TWILIO_PHONE_NUMBER
      })

      console.log('Twilio API Response:', {
        sid: result.sid,
        status: result.status,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        dateCreated: result.dateCreated,
        direction: result.direction,
        price: result.price
      })

      if (result.errorCode) {
        throw new Error(`Twilio error: ${result.errorCode} - ${result.errorMessage}`)
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.sid,
          status: result.status,
          error: null
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch (twilioError) {
      console.error('Twilio API Error Details:', {
        code: twilioError.code,
        message: twilioError.message,
        status: twilioError.status,
        moreInfo: twilioError.moreInfo,
        details: twilioError.details
      })
      throw twilioError
    }
  } catch (error) {
    console.error('Full error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    })
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: {
          code: error.code,
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