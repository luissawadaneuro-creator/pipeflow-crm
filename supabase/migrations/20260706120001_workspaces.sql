-- Workspaces & Workspace Members
-- Multi-tenant core: every other table scopes its data to a workspace_id.

create extension if not exists "pgcrypto";

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  owner_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_status text check (plan_status in ('active', 'canceled', 'trialing')),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists idx_workspaces_owner_id on public.workspaces(owner_id);
create index if not exists idx_workspace_members_user_id on public.workspace_members(user_id);
create index if not exists idx_workspace_members_workspace_id on public.workspace_members(workspace_id);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER) — avoid RLS recursion between
-- workspaces <-> workspace_members by checking membership outside of RLS.
-- ---------------------------------------------------------------------------

create or replace function public.is_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = p_user_id
  );
$$;

create or replace function public.is_workspace_admin(p_workspace_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = p_user_id
      and wm.role = 'admin'
  );
$$;

create or replace function public.get_user_workspaces(p_user_id uuid)
returns setof public.workspaces
language sql
security definer
set search_path = public
stable
as $$
  select w.*
  from public.workspaces w
  join public.workspace_members wm on wm.workspace_id = w.id
  where wm.user_id = p_user_id
  order by w.created_at asc;
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- workspaces: any member can read; only admins can update/delete; any
-- authenticated user can create a workspace (they become its owner).
create policy "workspaces_select_members"
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id, auth.uid()));

create policy "workspaces_insert_authenticated"
  on public.workspaces for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "workspaces_update_admins"
  on public.workspaces for update
  to authenticated
  using (public.is_workspace_admin(id, auth.uid()))
  with check (public.is_workspace_admin(id, auth.uid()));

create policy "workspaces_delete_admins"
  on public.workspaces for delete
  to authenticated
  using (public.is_workspace_admin(id, auth.uid()));

-- workspace_members: members can see their own workspace's roster;
-- only admins can add/remove/change members. A user can always see their
-- own membership row (needed to bootstrap the first admin check).
create policy "workspace_members_select_same_workspace"
  on public.workspace_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_workspace_member(workspace_id, auth.uid())
  );

create policy "workspace_members_insert_admins_or_self_owner"
  on public.workspace_members for insert
  to authenticated
  with check (
    public.is_workspace_admin(workspace_id, auth.uid())
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = auth.uid()
    )
  );

create policy "workspace_members_update_admins"
  on public.workspace_members for update
  to authenticated
  using (public.is_workspace_admin(workspace_id, auth.uid()))
  with check (public.is_workspace_admin(workspace_id, auth.uid()));

create policy "workspace_members_delete_admins"
  on public.workspace_members for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, auth.uid()));
