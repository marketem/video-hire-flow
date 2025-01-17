import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailPayload {
  email: string;
  firstName: string;
  trialEndsAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not found');
    }

    const { email, firstName, trialEndsAt } = await req.json() as WelcomeEmailPayload;
    const trialEndDate = new Date(trialEndsAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Create email message
    const emailData = {
      personalizations: [{
        to: [{ email }],
      }],
      from: { email: 'info@videovibecheck.com', name: 'VibeCheck' },
      subject: 'Welcome to VibeCheck! 🎉',
      content: [{
        type: 'text/html',
        value: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to VibeCheck, ${firstName}! 👋</h2>
            
            <p>We're excited to have you on board! Here's how to get started:</p>
            
            <ol style="line-height: 1.6;">
              <li><strong>Create your first job opening</strong> - Click the "Add Job" button on your dashboard</li>
              <li><strong>Share your job link</strong> - Each job has a unique link you can share with candidates</li>
              <li><strong>Review video submissions</strong> - Watch and evaluate candidate videos all in one place</li>
            </ol>

            <p style="margin-top: 20px;"><strong>Important:</strong> Your free trial ends on ${trialEndDate}. After this date, your card will be charged based on your selected plan.</p>

            <p style="margin-top: 20px;">Need help getting started? Check out our:</p>
            <ul style="line-height: 1.6;">
              <li>User Guide (click your profile picture → User Guide)</li>
              <li>Support team (click your profile picture → Support)</li>
            </ul>

            <p style="margin-top: 20px;">Best regards,<br>The VibeCheck Team</p>
          </div>
        `,
      }],
    };

    console.log('Sending welcome email to:', email);

    // Send email using SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid API error:', errorText);
      throw new Error(`SendGrid API error: ${errorText}`);
    }

    console.log('Welcome email sent successfully to:', email);

    return new Response(
      JSON.stringify({ message: 'Welcome email sent successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
};

serve(handler);