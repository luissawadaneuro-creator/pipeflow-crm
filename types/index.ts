export type WorkspacePlan = 'free' | 'pro'
export type WorkspaceRole = 'admin' | 'member'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost'
export type DealStage =
  | 'new_lead'
  | 'contacted'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost'
export type ActivityType = 'call' | 'email' | 'meeting' | 'note'

export interface Workspace {
  id: string
  name: string
  slug: string
  plan: WorkspacePlan
  owner_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_status: 'active' | 'canceled' | 'trialing' | 'past_due' | null
  created_at: string
}

export interface WorkspaceMember {
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  created_at: string
}

export interface Lead {
  id: string
  workspace_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  role: string | null
  status: LeadStatus
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  workspace_id: string
  title: string
  value: number
  stage: DealStage
  lead_id: string | null
  assigned_to: string | null
  deadline: string | null
  position: number
  created_at: string
  updated_at: string
}

export interface Activity {
  id: string
  workspace_id: string
  lead_id: string
  author_id: string
  type: ActivityType
  description: string
  activity_date: string
  created_at: string
}

export interface Member {
  user_id: string
  workspace_id: string
  role: WorkspaceRole
  created_at: string
  email?: string
  full_name?: string
}

export interface WorkspaceInvite {
  id: string
  workspace_id: string
  email: string
  role: WorkspaceRole
  token: string
  invited_by: string
  accepted_at: string | null
  expires_at: string
  created_at: string
}
