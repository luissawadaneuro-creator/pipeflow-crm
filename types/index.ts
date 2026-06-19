export type PipelineStage =
  | 'novo_lead'
  | 'contato_realizado'
  | 'proposta_enviada'
  | 'negociacao'
  | 'fechado_ganho'
  | 'fechado_perdido';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note';

export type WorkspaceMemberRole = 'admin' | 'member';

export type SubscriptionPlan = 'free' | 'pro';

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  created_at: string;
}

export interface Lead {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  status: PipelineStage;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Deal {
  id: string;
  workspace_id: string;
  title: string;
  value: number;
  stage: PipelineStage;
  lead_id: string | null;
  owner_id: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  workspace_id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  author_id: string;
  created_at: string;
}

export interface Subscription {
  workspace_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
  current_period_end: string | null;
}
