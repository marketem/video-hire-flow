import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

interface WelcomeEmailData {
  email: string;
  firstName: string;
  trialEndsAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { email, firstName, trialEndsAt } = await req.json() as WelcomeEmailData

    const trialEndDate = new Date(trialEndsAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })

    // Send welcome email to the new user
    const welcomeEmailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }]
        }],
        from: {
          email: 'info@videovibecheck.com',
          name: 'VibeCheck'
        },
        subject: 'Welcome to VibeCheck! Here\'s how to get started',
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <img src="https://videovibecheck.com/lovable-uploads/658547e3-9dac-4df0-84d6-a891876840a9.png" alt="VibeCheck Logo" style="width: 150px; margin: 20px 0;">
              
              <h1 style="color: #1a365d;">Welcome to VibeCheck, ${firstName}! 🎉</h1>
              
              <p>We're excited to have you on board! Your free trial is now active and will run until ${trialEndDate}.</p>
              
              <h2 style="color: #2d3748;">Here's how to get started:</h2>
              
              <ol style="line-height: 1.6;">
                <li><strong>Create your first job opening</strong><br>
                Click on "Add Job Opening" to post your first position.</li>
                
                <li><strong>Add candidates</strong><br>
                Upload candidates manually or import them in bulk.</li>
                
                <li><strong>Send video invites</strong><br>
                Invite candidates to record their video responses.</li>
                
                <li><strong>Review submissions</strong><br>
                Watch candidate videos and make hiring decisions faster.</li>
              </ol>
              
              <p style="margin-top: 20px;">
                <strong>Important:</strong> Your trial ends on ${trialEndDate}. After this date, your card will be charged based on your selected plan.
              </p>
              
              <p>Need help? Our support team is here for you. Just reply to this email or check out our getting started guide in the dashboard.</p>
              
              <div style="margin-top: 30px; padding: 20px; background-color: #f7fafc; border-radius: 5px;">
                <p style="margin: 0;"><strong>Quick Tip:</strong> Start by creating your first job opening to see how VibeCheck can transform your hiring process.</p>
              </div>
              
              <p style="margin-top: 30px; color: #718096; font-size: 14px;">
                Best regards,<br>
                The VibeCheck Team
              </p>
            </div>
          `
        }]
      })
    });

    if (!welcomeEmailResponse.ok) {
      throw new Error(`Failed to send welcome email: ${welcomeEmailResponse.statusText}`);
    }

    // Send notification email to admin
    const notificationEmailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'info@videovibecheck.com' }]
        }],
        from: {
          email: 'info@videovibecheck.com',
          name: 'VibeCheck System'
        },
        subject: 'New User Signup Alert',
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1a365d;">New User Signup Alert</h1>
              
              <p>A new user has just signed up for VibeCheck:</p>
              
              <ul style="line-height: 1.6;">
                <li><strong>Name:</strong> ${firstName}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Trial End Date:</strong> ${trialEndDate}</li>
              </ul>
            </div>
          `
        }]
      })
    });

    if (!notificationEmailResponse.ok) {
      console.error('Failed to send notification email:', await notificationEmailResponse.text());
      // Don't throw error here as we don't want to affect the user experience if admin notification fails
    }

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending emails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
})