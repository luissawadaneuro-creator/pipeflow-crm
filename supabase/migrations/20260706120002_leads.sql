-- Leads
-- A contact/prospect scoped to a workspace.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  role text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'lost')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_workspace_id on public.leads(workspace_id);
create index if not exists idx_leads_status on public.leads(status);
create index if not exists idx_leads_assigned_to on public.leads(assigned_to);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_leads_updated_at on public.leads;
create trigger trg_leads_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS — access limited to members of the lead's workspace.
-- ---------------------------------------------------------------------------

alter table public.leads enable row level security;

create policy "leads_select_workspace_members"
  on public.leads for select
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())));

create policy "leads_insert_workspace_members"
  on public.leads for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

create policy "leads_update_workspace_members"
  on public.leads for update
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())))
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

create policy "leads_delete_workspace_admins"
  on public.leads for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));
