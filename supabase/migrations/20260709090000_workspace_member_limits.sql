-- Workspace Member Limits (M8/M9 collaboration)
-- Free plan workspaces are capped at 2 members. Counts active members +
-- pending (non-expired, non-accepted) invites so an admin can't out-invite
-- the cap before invitees accept.

create or replace function public.count_workspace_seats(p_workspace_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*)::int from public.workspace_members where workspace_id = p_workspace_id)
    + (
      select count(*)::int from public.workspace_invites
      where workspace_id = p_workspace_id
        and accepted_at is null
        and expires_at > now()
    );
$$;
