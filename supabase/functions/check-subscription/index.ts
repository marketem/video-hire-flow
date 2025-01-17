import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('No user found')
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Check if trial is still valid
    const trialEndsAt = user.user_metadata.trial_ends_at
    const isTrialValid = trialEndsAt && new Date(trialEndsAt) > new Date()

    if (isTrialValid) {
      return new Response(
        JSON.stringify({ 
          status: 'trial',
          trialEndsAt
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // If trial expired, check for active subscription
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          status: 'expired',
          message: 'Trial expired and no subscription found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      price: 'price_1Qi8HJFyXeOmqbGvbOIxXmiW',
      limit: 1
    })

    return new Response(
      JSON.stringify({ 
        status: subscriptions.data.length > 0 ? 'subscribed' : 'expired',
        subscription: subscriptions.data[0] || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error checking subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})