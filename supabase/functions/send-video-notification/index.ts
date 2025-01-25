import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const resend = new Resend(RESEND_API_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  candidateId: string
  candidateName: string
  candidateEmail: string
  jobId: string
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
    
    if (!RESEND_API_KEY) {
      console.error('Resend API key not found')
      throw new Error('Resend API key not found')
    }

    const payload: NotificationPayload = await req.json()
    console.log('Received payload:', {
      candidateId: payload.candidateId,
      candidateName: payload.candidateName,
      jobId: payload.jobId
    })

    // Create Supabase client with service role to fetch job details and hiring manager
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get job details and hiring manager email
    const { data: jobData, error: jobError } = await supabaseClient
      .from('job_openings')
      .select(`
        *,
        profiles:user_id (
          id,
          email
        )
      `)
      .eq('id', payload.jobId)
      .single()

    if (jobError) {
      console.error('Error fetching job details:', jobError)
      throw jobError
    }

    // Send confirmation email to candidate
    console.log('Sending confirmation email to candidate...')
    await resend.emails.send({
      from: 'VibeCheck <notifications@videovibecheck.com>',
      to: [payload.candidateEmail],
      subject: 'Video Submission Received',
      html: `
        <h2>Thank You for Your Video Submission</h2>
        <p>Hello ${payload.candidateName},</p>
        <p>We have received your video submission for the position of ${jobData.title}.</p>
        <p>Our hiring team will review your submission and will be in touch if we feel there's a good fit.</p>
        <p>Thank you for taking the time to complete this step in the application process.</p>
        <br>
        <p>Best regards,<br>The VibeCheck Team</p>
      `
    })

    // Send notification to hiring manager
    if (jobData.profiles?.email) {
      console.log('Sending notification to hiring manager...')
      await resend.emails.send({
        from: 'VibeCheck <notifications@videovibecheck.com>',
        to: [jobData.profiles.email],
        subject: `New Video Submission: ${payload.candidateName} - ${jobData.title}`,
        html: `
          <h2>New Video Submission Received</h2>
          <p>Hello,</p>
          <p>A new video submission has been received for the ${jobData.title} position.</p>
          <p><strong>Candidate Details:</strong></p>
          <ul>
            <li>Name: ${payload.candidateName}</li>
            <li>Email: ${payload.candidateEmail}</li>
          </ul>
          <p>You can review this submission by logging into your VibeCheck dashboard.</p>
          <br>
          <p>Best regards,<br>The VibeCheck Team</p>
        `
      })
    }

    console.log('Emails sent successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Notification emails sent successfully'
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