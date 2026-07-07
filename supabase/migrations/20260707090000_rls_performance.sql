-- RLS Performance Hardening
-- Wraps auth.uid() in a (select ...) in every policy so Postgres evaluates it
-- once per statement (via initPlan) instead of once per row. Without this,
-- auth.uid() is re-evaluated for every row scanned, which becomes a
-- meaningful cost on leads/deals/activities as tables grow.
-- Reference: supabase-postgres-best-practices §3.3.

-- ---------------------------------------------------------------------------
-- Helper functions — same logic, but callers now pass (select auth.uid()).
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

-- ---------------------------------------------------------------------------
-- workspaces / workspace_members
-- ---------------------------------------------------------------------------

-- Includes owner_id check so INSERT ... RETURNING works before the creator's
-- workspace_members row exists (createWorkspace() inserts workspaces first,
-- then workspace_members — PostgREST's RETURNING re-checks the SELECT policy
-- against the just-inserted row, which would otherwise fail with 42501).
drop policy if exists "workspaces_select_members" on public.workspaces;
create policy "workspaces_select_members"
  on public.workspaces for select
  to authenticated
  using (
    owner_id = (select auth.uid())
    or public.is_workspace_member(id, (select auth.uid()))
  );

drop policy if exists "workspaces_insert_authenticated" on public.workspaces;
create policy "workspaces_insert_authenticated"
  on public.workspaces for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "workspaces_update_admins" on public.workspaces;
create policy "workspaces_update_admins"
  on public.workspaces for update
  to authenticated
  using (public.is_workspace_admin(id, (select auth.uid())))
  with check (public.is_workspace_admin(id, (select auth.uid())));

drop policy if exists "workspaces_delete_admins" on public.workspaces;
create policy "workspaces_delete_admins"
  on public.workspaces for delete
  to authenticated
  using (public.is_workspace_admin(id, (select auth.uid())));

drop policy if exists "workspace_members_select_same_workspace" on public.workspace_members;
create policy "workspace_members_select_same_workspace"
  on public.workspace_members for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or public.is_workspace_member(workspace_id, (select auth.uid()))
  );

drop policy if exists "workspace_members_insert_admins_or_self_owner" on public.workspace_members;
create policy "workspace_members_insert_admins_or_self_owner"
  on public.workspace_members for insert
  to authenticated
  with check (
    public.is_workspace_admin(workspace_id, (select auth.uid()))
    or exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = (select auth.uid())
    )
  );

drop policy if exists "workspace_members_update_admins" on public.workspace_members;
create policy "workspace_members_update_admins"
  on public.workspace_members for update
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())))
  with check (public.is_workspace_admin(workspace_id, (select auth.uid())));

drop policy if exists "workspace_members_delete_admins" on public.workspace_members;
create policy "workspace_members_delete_admins"
  on public.workspace_members for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------

drop policy if exists "leads_select_workspace_members" on public.leads;
create policy "leads_select_workspace_members"
  on public.leads for select
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())));

drop policy if exists "leads_insert_workspace_members" on public.leads;
create policy "leads_insert_workspace_members"
  on public.leads for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

drop policy if exists "leads_update_workspace_members" on public.leads;
create policy "leads_update_workspace_members"
  on public.leads for update
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())))
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

drop policy if exists "leads_delete_workspace_admins" on public.leads;
create policy "leads_delete_workspace_admins"
  on public.leads for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));

-- ---------------------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------------------

drop policy if exists "deals_select_workspace_members" on public.deals;
create policy "deals_select_workspace_members"
  on public.deals for select
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())));

drop policy if exists "deals_insert_workspace_members" on public.deals;
create policy "deals_insert_workspace_members"
  on public.deals for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

drop policy if exists "deals_update_workspace_members" on public.deals;
create policy "deals_update_workspace_members"
  on public.deals for update
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())))
  with check (public.is_workspace_member(workspace_id, (select auth.uid())));

drop policy if exists "deals_delete_workspace_admins" on public.deals;
create policy "deals_delete_workspace_admins"
  on public.deals for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));

-- ---------------------------------------------------------------------------
-- activities
-- ---------------------------------------------------------------------------

drop policy if exists "activities_select_workspace_members" on public.activities;
create policy "activities_select_workspace_members"
  on public.activities for select
  to authenticated
  using (public.is_workspace_member(workspace_id, (select auth.uid())));

drop policy if exists "activities_insert_workspace_members" on public.activities;
create policy "activities_insert_workspace_members"
  on public.activities for insert
  to authenticated
  with check (
    public.is_workspace_member(workspace_id, (select auth.uid()))
    and author_id = (select auth.uid())
  );

drop policy if exists "activities_update_author_or_admin" on public.activities;
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

drop policy if exists "activities_delete_author_or_admin" on public.activities;
create policy "activities_delete_author_or_admin"
  on public.activities for delete
  to authenticated
  using (
    author_id = (select auth.uid())
    or public.is_workspace_admin(workspace_id, (select auth.uid()))
  );

-- ---------------------------------------------------------------------------
-- workspace_invites
-- ---------------------------------------------------------------------------

drop policy if exists "workspace_invites_select_admins" on public.workspace_invites;
create policy "workspace_invites_select_admins"
  on public.workspace_invites for select
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));

drop policy if exists "workspace_invites_insert_admins" on public.workspace_invites;
create policy "workspace_invites_insert_admins"
  on public.workspace_invites for insert
  to authenticated
  with check (
    public.is_workspace_admin(workspace_id, (select auth.uid()))
    and invited_by = (select auth.uid())
  );

drop policy if exists "workspace_invites_update_admins" on public.workspace_invites;
create policy "workspace_invites_update_admins"
  on public.workspace_invites for update
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())))
  with check (public.is_workspace_admin(workspace_id, (select auth.uid())));

drop policy if exists "workspace_invites_delete_admins" on public.workspace_invites;
create policy "workspace_invites_delete_admins"
  on public.workspace_invites for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));
