-- Workspace Members Directory
-- Exposes member id + display name + email for a workspace, joining
-- auth.users (not directly queryable from the client) so the UI can
-- populate "responsável" selects with real users instead of mock names.

create or replace function public.get_workspace_members(p_workspace_id uuid)
returns table (
  user_id uuid,
  role text,
  email text,
  full_name text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    wm.user_id,
    wm.role,
    u.email,
    coalesce(u.raw_user_meta_data ->> 'full_name', u.email) as full_name
  from public.workspace_members wm
  join auth.users u on u.id = wm.user_id
  where public.is_workspace_member(p_workspace_id, (select auth.uid()))
    and wm.workspace_id = p_workspace_id
  order by full_name asc;
$$;
