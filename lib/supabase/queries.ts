import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'
import type {
  Workspace,
  Lead,
  Deal,
  LeadStatus,
  DealStage,
  Member,
  Activity,
  WorkspaceInvite,
} from '@/types'

export async function getUserWorkspaces(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Pick<Workspace, 'id' | 'name' | 'slug' | 'plan'>[]> {
  const { data, error } = await supabase.rpc('get_user_workspaces', { p_user_id: userId })

  if (error || !data) return []

  return data.map((w) => ({ id: w.id, name: w.name, slug: w.slug, plan: w.plan }))
}

export async function getWorkspaceMembers(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<Member[]> {
  const { data, error } = await supabase.rpc('get_workspace_members', {
    p_workspace_id: workspaceId,
  })

  if (error || !data) return []

  return data.map((m) => ({
    user_id: m.user_id,
    workspace_id: workspaceId,
    role: m.role,
    created_at: '',
    email: m.email ?? undefined,
    full_name: m.full_name ?? undefined,
  }))
}

export async function getPendingInvites(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<WorkspaceInvite[]> {
  const { data, error } = await supabase
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data
}

export async function countWorkspaceSeats(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<number> {
  const { data, error } = await supabase.rpc('count_workspace_seats', {
    p_workspace_id: workspaceId,
  })

  if (error || data === null) return 0
  return data
}

export interface LeadFilters {
  q?: string
  status?: LeadStatus
  assigned?: string
}

export async function getLeads(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  filters: LeadFilters = {}
): Promise<Lead[]> {
  let query = supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.assigned) {
    query = query.eq('assigned_to', filters.assigned)
  }
  if (filters.q) {
    const term = filters.q.replace(/[%_]/g, '')
    query = query.or(`name.ilike.%${term}%,company.ilike.%${term}%`)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data
}

export async function getLead(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  leadId: string
): Promise<Lead | null> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('id', leadId)
    .maybeSingle()

  if (error || !data) return null
  return data
}

export interface DealWithLead extends Deal {
  lead: Pick<Lead, 'id' | 'name' | 'company'> | null
}

export async function getDeals(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<DealWithLead[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('*, lead:leads(id, name, company)')
    .eq('workspace_id', workspaceId)
    .order('position', { ascending: true })

  if (error || !data) return []
  return data as unknown as DealWithLead[]
}

const OPEN_STAGES: DealStage[] = ['new_lead', 'contacted', 'proposal_sent', 'negotiation']

export interface DashboardMetrics {
  totalLeads: number
  openDeals: number
  pipelineValue: number
  conversionRate: number
}

export async function getDashboardMetrics(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<DashboardMetrics> {
  const [{ count: totalLeads }, { data: deals }] = await Promise.all([
    supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId),
    supabase.from('deals').select('stage, value').eq('workspace_id', workspaceId),
  ])

  const allDeals = deals ?? []
  const openDeals = allDeals.filter((d) => OPEN_STAGES.includes(d.stage))
  const won = allDeals.filter((d) => d.stage === 'won')
  const lost = allDeals.filter((d) => d.stage === 'lost')

  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
  const conversionRate =
    won.length + lost.length > 0 ? (won.length / (won.length + lost.length)) * 100 : 0

  return {
    totalLeads: totalLeads ?? 0,
    openDeals: openDeals.length,
    pipelineValue,
    conversionRate,
  }
}

export interface FunnelStagePoint {
  stage: DealStage
  label: string
  count: number
  color: string
}

const STAGE_ORDER: DealStage[] = [
  'new_lead',
  'contacted',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
]

const STAGE_LABELS: Record<DealStage, string> = {
  new_lead: 'Novo Lead',
  contacted: 'Contatado',
  proposal_sent: 'Proposta Enviada',
  negotiation: 'Negociação',
  won: 'Fechado Ganho',
  lost: 'Fechado Perdido',
}

const STAGE_COLORS: Record<DealStage, string> = {
  new_lead: '#5B7FFF',
  contacted: '#00B4D8',
  proposal_sent: '#CAFF33',
  negotiation: '#FF6B35',
  won: '#2ED573',
  lost: '#FF4757',
}

export async function getDealsByStage(
  supabase: SupabaseClient<Database>,
  workspaceId: string
): Promise<FunnelStagePoint[]> {
  const { data } = await supabase.from('deals').select('stage').eq('workspace_id', workspaceId)
  const deals = data ?? []

  return STAGE_ORDER.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: deals.filter((d) => d.stage === stage).length,
    color: STAGE_COLORS[stage],
  }))
}

export async function getUpcomingDeals(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  referenceDate: Date = new Date(),
  limit = 5
): Promise<DealWithLead[]> {
  const horizon = new Date(referenceDate.getTime() + 7 * 86_400_000)

  const { data, error } = await supabase
    .from('deals')
    .select('*, lead:leads(id, name, company)')
    .eq('workspace_id', workspaceId)
    .in('stage', OPEN_STAGES)
    .not('deadline', 'is', null)
    .lte('deadline', horizon.toISOString())
    .order('deadline', { ascending: true })
    .limit(limit)

  if (error || !data) return []
  return data as unknown as DealWithLead[]
}

export async function getActivities(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  leadId: string
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('lead_id', leadId)
    .order('activity_date', { ascending: false })

  if (error || !data) return []
  return data
}
