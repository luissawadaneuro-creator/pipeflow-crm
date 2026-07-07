-- Deals
-- A sales opportunity linked to a lead, positioned on the Kanban pipeline.

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  value numeric(12, 2) not null default 0,
  stage text not null default 'new_lead' check (
    stage in ('new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost')
  ),
  lead_id uuid references public.leads(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  deadline timestamptz,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_deals_workspace_id on public.deals(workspace_id);
create index if not exists idx_deals_stage on public.deals(stage);
create index if not exists idx_deals_position on public.deals(position);
create index if not exists idx_deals_lead_id on public.deals(lead_id);

drop trigger if exists trg_deals_updated_at on public.deals;
create trigger trg_deals_updated_at
  before update on public.deals
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — access limited to members of the deal's workspace.
-- ---------------------------------------------------------------------------

alter table public.deals enable row level security;

create policy "deals_select_workspace_members"
  on public.deals for select
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())));

create policy "deals_insert_workspace_members"
  on public.deals for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

create policy "deals_update_workspace_members"
  on public.deals for update
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())))
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

create policy "deals_delete_workspace_admins"
  on public.deals for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));
