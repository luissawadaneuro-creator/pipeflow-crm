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

  console.log(`[stripe webhook] received event: ${event.type}`)

  const admin = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const workspaceId = session.metadata?.workspace_id ?? session.client_reference_id
      const userId = session.metadata?.user_id
      if (!workspaceId) {
        console.error('[stripe webhook] checkout.session.completed missing workspace_id')
        break
      }

      const subscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id

      const { error: checkoutError } = await admin
        .from('workspaces')
        .update({
          plan: 'pro',
          plan_status: 'active',
          stripe_customer_id: customerId ?? null,
          stripe_subscription_id: subscriptionId ?? null,
          cancel_at: null,
        })
        .eq('id', workspaceId)

      if (checkoutError) {
        console.error('[stripe webhook] checkout.session.completed update failed:', checkoutError)
      }

      if (userId) {
        console.log(`[stripe webhook] checkout completed by user ${userId} for workspace ${workspaceId}`)
      }

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
      const cancelAt = subscription.cancel_at_period_end && subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null

      const { error: subUpdatedError } = await admin
        .from('workspaces')
        .update({
          plan_status: planStatus,
          plan: planStatus === 'canceled' ? 'free' : 'pro',
          cancel_at: cancelAt,
        })
        .eq('id', workspaceId)

      if (subUpdatedError) {
        console.error('[stripe webhook] customer.subscription.updated update failed:', subUpdatedError)
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const workspaceId = subscription.metadata?.workspace_id
      if (!workspaceId) {
        console.error('[stripe webhook] customer.subscription.deleted missing workspace_id')
        break
      }

      const { error: subDeletedError } = await admin
        .from('workspaces')
        .update({
          plan: 'free',
          plan_status: 'canceled',
          stripe_subscription_id: null,
          cancel_at: null,
        })
        .eq('id', workspaceId)

      if (subDeletedError) {
        console.error('[stripe webhook] customer.subscription.deleted update failed:', subDeletedError)
      }

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionRef = invoice.parent?.subscription_details?.subscription
      const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef?.id

      if (!subscriptionId) {
        console.error('[stripe webhook] invoice.payment_failed missing subscription id')
        break
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      const workspaceId = subscription.metadata?.workspace_id
      if (!workspaceId) {
        console.error('[stripe webhook] invoice.payment_failed missing workspace_id')
        break
      }

      const { error: invoiceFailedError } = await admin
        .from('workspaces')
        .update({ plan_status: 'past_due' })
        .eq('id', workspaceId)

      if (invoiceFailedError) {
        console.error('[stripe webhook] invoice.payment_failed update failed:', invoiceFailedError)
      }

      break
    }

    default:
      break
  }

  return NextResponse.json({ received: true })
}

function mapStripeStatus(
  status: Stripe.Subscription.Status
): 'active' | 'canceled' | 'trialing' | 'past_due' {
  if (status === 'trialing') return 'trialing'
  if (status === 'active') return 'active'
  if (status === 'past_due') return 'past_due'
  return 'canceled'
}
