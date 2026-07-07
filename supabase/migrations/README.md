# Migrations

Aplicar em ordem no SQL Editor do Supabase Studio (ou via `supabase db push` se o projeto estiver linkado):

1. `20260706120001_workspaces.sql` — `workspaces`, `workspace_members`, funções `is_workspace_member`, `is_workspace_admin`, `get_user_workspaces`, RLS
2. `20260706120002_leads.sql` — `leads`, trigger `set_updated_at`, RLS
3. `20260706120003_deals.sql` — `deals`, RLS
4. `20260706120004_activities.sql` — `activities`, RLS
5. `20260706120005_workspace_invites.sql` — `workspace_invites`, RLS
6. `20260707090000_rls_performance.sql` — recria todas as policies com `(select auth.uid())` em vez de `auth.uid()` direto, evitando reavaliação por linha (ver `supabase-postgres-best-practices` §3.3). **Necessário mesmo se as migrations 1-5 já foram aplicadas antes desta correção.**

Após aplicar, regenerar os tipos:

```
npx supabase gen types typescript --project-id <project-id> > types/supabase.ts
```
