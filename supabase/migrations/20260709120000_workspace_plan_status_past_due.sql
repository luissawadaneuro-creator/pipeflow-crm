-- Adds 'past_due' to workspaces.plan_status so the Stripe webhook can
-- reflect a failed subscription invoice before Stripe cancels it outright.

alter table public.workspaces
  drop constraint if exists workspaces_plan_status_check;

alter table public.workspaces
  add constraint workspaces_plan_status_check
  check (plan_status in ('active', 'canceled', 'trialing', 'past_due'));
