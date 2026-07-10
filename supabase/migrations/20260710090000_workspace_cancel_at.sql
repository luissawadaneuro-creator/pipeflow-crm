-- Tracks a scheduled (end-of-period) subscription cancellation so the UI
-- can show "Pro until <date>" instead of downgrading immediately when the
-- customer cancels via the Stripe Customer Portal (cancel_at_period_end).

alter table public.workspaces
  add column if not exists cancel_at timestamptz;
