-- Workspace Invites
-- Email invitations to join a workspace (M8).

create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid not null references auth.users(id) on delete cascade,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_invites_workspace_id on public.workspace_invites(workspace_id);
create index if not exists idx_workspace_invites_email on public.workspace_invites(email);
create index if not exists idx_workspace_invites_token on public.workspace_invites(token);

-- ---------------------------------------------------------------------------
-- RLS — only workspace admins can view/manage invites for their workspace.
-- The invite acceptance flow (by token) is handled server-side via the
-- service role key in the API route, bypassing RLS by design.
-- ---------------------------------------------------------------------------

alter table public.workspace_invites enable row level security;

create policy "workspace_invites_select_admins"
  on public.workspace_invites for select
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));

create policy "workspace_invites_insert_admins"
  on public.workspace_invites for insert
  to authenticated
  with check (
    public.is_workspace_admin(workspace_id, (select auth.uid()))
    and invited_by = (select auth.uid())
  );

create policy "workspace_invites_update_admins"
  on public.workspace_invites for update
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())))
  with check (public.is_workspace_admin(workspace_id, (select auth.uid())));

create policy "workspace_invites_delete_admins"
  on public.workspace_invites for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id, (select auth.uid())));
