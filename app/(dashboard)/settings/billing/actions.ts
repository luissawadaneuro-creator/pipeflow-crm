'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceContext } from '@/lib/supabase/workspace-context'
import { stripe } from '@/lib/stripe/client'

export interface BillingActionResult {
  error?: string
}

async function requireAdminWorkspace(workspaceId: string, userId: string) {
  const supabase = await createClient()
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', userId)
    .maybeSingle()

  return membership?.role === 'admin'
}

export async function createCheckoutSession(): Promise<BillingActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const isAdmin = await requireAdminWorkspace(context.workspaceId, context.userId)
  if (!isAdmin) return { error: 'Apenas admins podem gerenciar a assinatura do workspace.' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, plan, stripe_customer_id')
    .eq('id', context.workspaceId)
    .single()

  if (!workspace) return { error: 'Workspace não encontrado.' }
  if (workspace.plan === 'pro') return { error: 'Este workspace já está no plano Pro.' }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: workspace.stripe_customer_id ?? undefined,
    customer_email: workspace.stripe_customer_id ? undefined : user?.email ?? undefined,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?checkout=canceled`,
    client_reference_id: workspace.id,
    metadata: { workspace_id: workspace.id, user_id: context.userId },
    subscription_data: { metadata: { workspace_id: workspace.id, user_id: context.userId } },
  })

  if (!session.url) return { error: 'Não foi possível iniciar o checkout. Tente novamente.' }

  redirect(session.url)
}

export async function createPortalSession(): Promise<BillingActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const isAdmin = await requireAdminWorkspace(context.workspaceId, context.userId)
  if (!isAdmin) return { error: 'Apenas admins podem gerenciar a assinatura do workspace.' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('stripe_customer_id')
    .eq('id', context.workspaceId)
    .single()

  if (!workspace?.stripe_customer_id) {
    return { error: 'Este workspace ainda não tem uma assinatura ativa.' }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  redirect(session.url)
}

export async function reactivateSubscription(): Promise<BillingActionResult> {
  const supabase = await createClient()
  const context = await getActiveWorkspaceContext(supabase)
  if (!context) return { error: 'Sessão expirada. Faça login novamente.' }

  const isAdmin = await requireAdminWorkspace(context.workspaceId, context.userId)
  if (!isAdmin) return { error: 'Apenas admins podem gerenciar a assinatura do workspace.' }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('stripe_subscription_id')
    .eq('id', context.workspaceId)
    .single()

  if (!workspace?.stripe_subscription_id) {
    return { error: 'Este workspace não tem uma assinatura ativa para reativar.' }
  }

  console.log(
    `[reactivateSubscription] updating subscription ${workspace.stripe_subscription_id} for workspace ${context.workspaceId}`
  )

  try {
    const updated = await stripe.subscriptions.update(workspace.stripe_subscription_id, {
      cancel_at_period_end: false,
    })
    console.log(
      `[reactivateSubscription] stripe response: status=${updated.status} cancel_at_period_end=${updated.cancel_at_period_end} cancel_at=${updated.cancel_at}`
    )
  } catch (err) {
    console.error('[reactivateSubscription] stripe.subscriptions.update failed:', err)
    return { error: 'Não foi possível reativar a assinatura no Stripe. Tente novamente.' }
  }

  const { error: dbError } = await supabase
    .from('workspaces')
    .update({ cancel_at: null })
    .eq('id', context.workspaceId)

  if (dbError) {
    console.error('[reactivateSubscription] supabase update failed:', dbError)
    return { error: 'Assinatura reativada no Stripe, mas houve erro ao atualizar o workspace.' }
  }

  return {}
}
