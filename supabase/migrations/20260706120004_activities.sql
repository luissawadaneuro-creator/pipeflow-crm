-- Activities
-- A logged interaction (call, email, meeting, note) tied to a lead.

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('call', 'email', 'meeting', 'note')),
  description text not null,
  activity_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_workspace_id on public.activities(workspace_id);
create index if not exists idx_activities_lead_id on public.activities(lead_id);
create index if not exists idx_activities_activity_date on public.activities(activity_date desc);

-- ---------------------------------------------------------------------------
-- RLS — access limited to members of the activity's workspace.
-- ---------------------------------------------------------------------------

alter table public.activities enable row level security;

create policy "activities_select_workspace_members"
  on public.activities for select
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())));

create policy "activities_insert_workspace_members"
  on public.activities for insert
  to authenticated
  with check (
    public.is_workspace_member(workspace_id, (select auth.uid()))
    and author_id = (select auth.uid())
  );

create policy "activities_update_author_or_admin"
  on public.activities for update
  to authenticated
  using (
    author_id = (select auth.uid())
    or public.is_workspace_admin(workspace_id, (select auth.uid()))
  )
  with check (
    author_id = (select auth.uid())
    or public.is_workspace_admin(workspace_id, (select auth.uid()))
  );

create policy "activities_delete_author_or_admin"
  on public.activities for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or public.is_workspace_admin(workspace_id, (select auth.uid()))
  );
