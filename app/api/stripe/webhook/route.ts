import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[stripe webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata?.workspace_id ?? session.client_reference_id
      if (!workspaceId) {
        console.error('[stripe webhook] checkout.session.completed missing workspace_id')
        break
      }

      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id

      await admin
        .from('workspaces')
        .update({
          plan: 'pro',
          plan_status: 'active',
          stripe_customer_id: customerId ?? null,
          stripe_subscription_id: subscriptionId ?? null,
        })
        .eq('id', workspaceId)

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const workspaceId = subscription.metadata?.workspace_id
      if (!workspaceId) {
        console.error('[stripe webhook] customer.subscription.updated missing workspace_id')
        break
      }

      const planStatus = mapStripeStatus(subscription.status)

      await admin
        .from('workspaces')
        .update({
          plan_status: planStatus,
          plan: planStatus === 'canceled' ? 'free' : 'pro',
        })
        .eq('id', workspaceId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const workspaceId = subscription.metadata?.workspace_id
      if (!workspaceId) {
        console.error('[stripe webhook] customer.subscription.deleted missing workspace_id')
        break
      }

      await admin
        .from('workspaces')
        .update({
          plan: 'free',
          plan_status: 'canceled',
          stripe_subscription_id: null,
        })
        .eq('id', workspaceId)

      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}

function mapStripeStatus(status: Stripe.Subscription.Status): 'active' | 'canceled' | 'trialing' {
  if (status === 'trialing') return 'trialing'
  if (status === 'active') return 'active'
  return 'canceled'
}
