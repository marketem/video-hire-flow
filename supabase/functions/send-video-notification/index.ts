import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import sgMail from "npm:@sendgrid/mail"

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
sgMail.setApiKey(SENDGRID_API_KEY!)

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
    
    if (!SENDGRID_API_KEY) {
      console.error('SendGrid API key not found')
      throw new Error('SendGrid API key not found')
    }

    const payload: NotificationPayload = await req.json()
    console.log('Received payload:', payload)

    // Create Supabase client with service role
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

    // Get job details and user email using a raw query to avoid PostgREST relationship issues
    console.log('Fetching job details for job ID:', payload.jobId)
    const { data: jobData, error: jobError } = await supabaseClient
      .from('job_openings')
      .select('title, user_id')
      .eq('id', payload.jobId)
      .single()

    if (jobError) {
      console.error('Error fetching job details:', jobError)
      throw jobError
    }

    if (!jobData?.user_id) {
      console.error('No user_id found for job:', jobData)
      throw new Error('User ID not found')
    }

    // Get user email from auth.users table
    const { data: userData, error: userError } = await supabaseClient
      .auth.admin.getUserById(jobData.user_id)

    if (userError || !userData.user?.email) {
      console.error('Error fetching user email:', userError)
      throw new Error('User email not found')
    }

    // Send confirmation email to candidate
    console.log('Sending confirmation email to candidate:', payload.candidateEmail)
    const candidateEmail = {
      from: 'notifications@videovibecheck.com',
      to: payload.candidateEmail,
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
    }

    // Send notification to hiring manager
    console.log('Sending notification to hiring manager:', userData.user.email)
    const managerEmail = {
      from: 'notifications@videovibecheck.com',
      to: userData.user.email,
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
    }

    // Send both emails
    console.log('Sending emails...')
    await Promise.all([
      sgMail.send(candidateEmail),
      sgMail.send(managerEmail)
    ])

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
    console.error('Error in send-video-notification function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
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