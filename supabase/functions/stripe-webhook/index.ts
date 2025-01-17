import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!webhookSecret || !signature) {
      throw new Error('Missing webhook secret or signature')
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        if (subscription.status === 'active') {
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          if (!customer.deleted && 'email' in customer) {
            const { data: users, error: userError } = await supabaseClient
              .from('auth')
              .select('id')
              .eq('email', customer.email)
              .single()

            if (userError) throw userError

            const { error: updateError } = await supabaseClient
              .from('profiles')
              .update({ has_premium_access: true })
              .eq('id', users.id)

            if (updateError) throw updateError
            console.log('Updated premium access for user:', users.id)
          }
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        const customer = await stripe.customers.retrieve(deletedSubscription.customer as string)
        if (!customer.deleted && 'email' in customer) {
          const { data: users, error: userError } = await supabaseClient
            .from('auth')
            .select('id')
            .eq('email', customer.email)
            .single()

          if (userError) throw userError

          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ has_premium_access: false })
            .eq('id', users.id)

          if (updateError) throw updateError
          console.log('Removed premium access for user:', users.id)
        }
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})