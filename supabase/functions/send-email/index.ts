import { serve } from "https://deno.fresh.dev/std@v9.6.1/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import * as sgMail from "https://esm.sh/@sendgrid/mail@7.7.0";

serve(async (req) => {
  try {
    const { name, email, message } = await req.json();
    
    // Get SendGrid API key from environment variable
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not found');
    }

    // Configure SendGrid
    sgMail.setApiKey(SENDGRID_API_KEY);

    // Create email message
    const msg = {
      to: 'your-email@example.com', // Replace with your email
      from: 'no-reply@yourdomain.com', // Replace with your verified sender
      subject: `New Contact Form Submission from ${name}`,
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
      html: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Message:</strong></p>
<p>${message}</p>
      `,
    };

    // Send email
    await sgMail.send(msg);

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send email' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});