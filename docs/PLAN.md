# PLAN.md — PipeFlow CRM · Plano de Execução

> **Estratégia:** Interface primeiro, backend depois.
> Cada milestone entrega uma fatia vertical funcional: UI estática → dados reais → lógica de negócio.
> Trabalhar em ordem. Testar visualmente e funcionalmente antes de avançar.

---

## Visão Geral das Branches

```
main
 └── develop
      ├── m1/setup
      ├── m2/auth-ui
      ├── m3/workspaces
      ├── m4/leads
      ├── m5/pipeline
      ├── m6/activities
      ├── m7/dashboard
      ├── m8/invites
      ├── m9/stripe
      └── m10/landing
```

Cada milestone: branch própria → PR para `develop` → merge → próxima branch.

---

## M1 — Setup & Fundação

**Branch:** `m1/setup`
**Objetivo:** Projeto Next.js 14 funcional com Tailwind, shadcn/ui, Supabase conectado e layout base do app.

### Entregas

#### Projeto
- [x] `npx create-next-app@latest` com TypeScript, Tailwind, App Router
- [x] Configurar `tsconfig.json` com `strict: true` e alias `@/`
- [x] Instalar dependências: `@supabase/supabase-js`, `@supabase/ssr`, `sonner`, `lucide-react`
- [x] Configurar `.env.local` com variáveis do Supabase
- [x] `.gitignore` incluindo `.env*.local`

#### Supabase
- [x] Criar projeto no Supabase
- [x] `lib/supabase/client.ts` — browser client (lazy singleton)
- [x] `lib/supabase/server.ts` — server component client
- [x] `lib/supabase/middleware.ts` — refresh de sessão
- [x] `proxy.ts` na raiz — proteção de rotas `/dashboard/*` (Next.js 16 usa `proxy.ts`)

#### shadcn/ui
- [x] `npx shadcn@latest init` (tema dark, cor base slate)
- [x] Instalar componentes base: `button`, `input`, `label`, `card`, `badge`, `dropdown-menu`, `dialog`, `sheet`, `skeleton`, `separator`, `avatar`, `tooltip`

#### Layout Base
- [x] `app/layout.tsx` — root layout com `<Toaster />` (sonner)
- [x] `app/(dashboard)/layout.tsx` — layout com Sidebar + Header
- [x] `components/shared/sidebar.tsx` — sidebar fixa 240px, links de navegação, logo
- [x] `components/shared/header.tsx` — breadcrumb + avatar do usuário
- [x] `types/index.ts` — tipos globais: `Workspace`, `Lead`, `Deal`, `Activity`, `Member`, `Stage`
- [x] Página placeholder para cada rota: `/dashboard`, `/leads`, `/pipeline`, `/settings`

#### Verificação
- [x] `npm run dev` sobe sem erros
- [x] Layout com sidebar e header renderiza em `/dashboard`
- [x] TypeScript compila sem erros (`npm run build`)

### Commit Final
```
feat: project setup — Next.js 14, Tailwind, shadcn/ui, Supabase clients, base layout
```

---

## M2 — Autenticação (UI → Supabase Auth)

**Branch:** `m2/auth-ui`
**Objetivo:** Fluxo completo de login, cadastro e reset de senha funcionando com Supabase Auth. Middleware protegendo rotas.

### Entregas

#### UI (construir primeiro com dados estáticos)
- [x] `app/(auth)/login/page.tsx` — form de e-mail + senha, link para cadastro
- [x] `app/(auth)/signup/page.tsx` — form de nome + e-mail + senha, link para login
- [x] `app/(auth)/reset-password/page.tsx` — form de e-mail para recuperação
- [x] `app/(auth)/update-password/page.tsx` — form de nova senha (via magic link)
- [x] Layout `app/(auth)/layout.tsx` — página centralizada sem sidebar
- [x] `app/(auth)/onboarding/page.tsx` — criação do primeiro workspace com indicador de progresso

#### Lógica de Auth
- [x] Server Actions em `app/(auth)/login/actions.ts` — `signInWithPassword`
- [x] Server Actions em `app/(auth)/signup/actions.ts` — `signUp`
- [x] Server Actions em `app/(auth)/reset-password/actions.ts` — `resetPasswordForEmail`
- [x] Redirecionamento pós-login para `/dashboard`
- [x] Redirecionamento pós-logout para `/login` (botão Sair no header)
- [x] Logout no header via `supabase.auth.signOut()`

#### Proteção de Rotas
- [x] `middleware.ts` bloqueia `/dashboard/*`, `/leads`, `/pipeline`, `/settings`, `/workspace`, `/onboarding` sem sessão → redireciona para `/login`
- [x] Usuário logado em `/login` → redireciona para `/dashboard`

#### Verificação
- [x] Cadastro cria usuário no Supabase Auth (testado via signUp real contra o projeto)
- [x] Login redireciona para `/dashboard`
- [x] Acesso a `/dashboard` sem login redireciona para `/login`
- [x] Reset de senha envia e-mail via Supabase (sujeito ao rate limit de e-mail do plano free — aceitável em ambiente de teste)

### Commit Final
```
feat: authentication — login, signup, password reset with Supabase Auth + route middleware
```

---

## M3 — Workspaces & Multi-empresa

**Branch:** `m3/workspaces`
**Objetivo:** Usuário cria seu primeiro workspace no onboarding, pode criar mais e alternar entre eles. RLS configurado no banco.

### Entregas

#### Banco de Dados (Supabase)
- [x] Tabela `workspaces` — `id`, `name`, `slug`, `plan` (free/pro), `owner_id`, `created_at`
- [x] Tabela `workspace_members` — `workspace_id`, `user_id`, `role` (admin/member), `created_at`
- [x] RLS em `workspaces` — usuário vê apenas workspaces onde é membro
- [x] RLS em `workspace_members` — membro vê apenas registros do seu workspace
- [x] Função SQL `get_user_workspaces(user_id)` para busca eficiente

#### UI — Onboarding
- [x] `app/(auth)/onboarding/page.tsx` — form de criação de workspace (nome); usado no lugar de `/workspace/new` como fluxo único de criação
- [x] Redirecionamento pós-cadastro para `/onboarding` se não houver workspace (via `app/(dashboard)/layout.tsx`)

#### UI — Workspace Switcher
- [x] `components/shared/workspace-switcher.tsx` — dropdown no topo da sidebar com lista de workspaces reais + botão "Criar novo"
- [x] Workspace ativo resolvido no Server Component (`app/(dashboard)/layout.tsx`) via cookie, sem Context client — `useWorkspace` não foi necessário
- [x] Cookie `active_workspace_id` setado no server para persistir entre reloads

#### Lógica
- [x] Server Action `createWorkspace` — cria workspace + insere membro como admin
- [x] Server Action `switchWorkspace` — atualiza cookie e redireciona
- [ ] Middleware lê `active_workspace_id` e injeta em headers para Server Components — não implementado; o layout do dashboard lê o cookie diretamente, suficiente para o uso atual

#### Verificação
- [x] Novo usuário é redirecionado para criar workspace
- [x] Workspace criado aparece no switcher
- [x] Dados de um workspace não vazam para outro (testado: RLS impede select e auto-inserção cruzada entre usuários)

### Commit Final
```
feat: workspaces — multi-tenant setup, workspace switcher, RLS policies
```

---

## M4 — Gestão de Leads

**Branch:** `m4/leads`
**Objetivo:** CRUD completo de leads com listagem, busca, filtros e página de detalhe.

### Entregas

#### Banco de Dados
- [x] Tabela `leads` — `id`, `workspace_id`, `name`, `email`, `phone`, `company`, `role`, `status`, `assigned_to`, `created_at`, `updated_at`
- [x] Status enum: `new`, `contacted`, `qualified`, `lost`
- [x] RLS — filtra por `workspace_id` via member check
- [x] Índices em `workspace_id`, `status`, `assigned_to`

#### UI — Lista de Leads (construir com mock data primeiro)
- [x] `app/(dashboard)/leads/page.tsx` — listagem em tabela
- [x] `components/leads/leads-table.tsx` — tabela com colunas: Nome, Empresa, E-mail, Status, Responsável, Data
- [x] `components/leads/leads-filters.tsx` — busca por texto + filtro por status + filtro por responsável
- [x] `components/leads/lead-status-badge.tsx` — badge colorido por status
- [x] `components/leads/lead-form.tsx` — form de criação/edição em Dialog
- [x] Skeleton loader para estado de loading

#### UI — Detalhe do Lead
- [x] `app/(dashboard)/leads/[id]/page.tsx` — página de detalhe
- [x] `components/leads/lead-profile.tsx` — card com dados completos do lead
- [x] Seção de atividades (placeholder para M6)
- [x] Seção de negócios vinculados (placeholder para M5)
- [ ] Breadcrumb: Leads > [Nome do Lead] — existe apenas botão "voltar", sem breadcrumb completo

#### Lógica
- [ ] Server Action `createLead` — implementado como estado local (mock), sem persistência real
- [ ] Server Action `updateLead` — implementado como estado local (mock), sem persistência real
- [ ] Server Action `deleteLead` — implementado como estado local (mock), sem persistência real
- [ ] Busca e filtros via query params na URL (sem estado client) — atualmente via estado client, não URL

#### Verificação
- [x] Criar, editar e deletar lead funciona (em memória, sem persistência)
- [x] Busca por nome filtra em tempo real (ou ao submeter)
- [x] Filtro por status funciona
- [x] Página de detalhe carrega dados corretos (mock)

### Commit Final
```
feat: leads — CRUD, list with search/filters, lead detail page
```

---

## M5 — Pipeline Kanban

**Branch:** `m5/pipeline`
**Objetivo:** Board Kanban com 6 colunas, cards de negócios com drag-and-drop persistido no banco.

### Entregas

#### Banco de Dados
- [x] Tabela `deals` — `id`, `workspace_id`, `title`, `value`, `stage`, `lead_id`, `assigned_to`, `deadline`, `position`, `created_at`, `updated_at`
- [x] Stage enum: `new_lead`, `contacted`, `proposal_sent`, `negotiation`, `won`, `lost`
- [x] RLS — filtra por `workspace_id`
- [x] Índice em `workspace_id`, `stage`, `position`

#### Instalação
- [x] `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

#### UI — Board (construir com mock data primeiro)
- [x] `app/(dashboard)/pipeline/page.tsx` — página do board
- [x] `components/pipeline/kanban-board.tsx` — container com DndContext
- [x] `components/pipeline/kanban-column.tsx` — coluna com SortableContext, label e contador
- [x] `components/pipeline/deal-card.tsx` — card com título, valor, lead, responsável, prazo
- [x] `components/pipeline/deal-form.tsx` — form de criação/edição de negócio em Dialog
- [x] Indicador visual de valor total por coluna
- [x] Cores diferenciadas: coluna "Fechado Ganho" (emerald), "Fechado Perdido" (red)

#### Drag-and-Drop
- [x] `useDraggable` / `useDroppable` via @dnd-kit nos cards e colunas
- [x] `onDragEnd` calcula novo `stage` e nova `position`
- [x] Atualização otimista do estado local antes da confirmação do server
- [ ] Server Action `updateDealStage(dealId, stage, position)` — persistência real ainda não implementada

#### Lógica
- [ ] Server Action `createDeal` — implementado como estado local (mock), sem persistência real
- [ ] Server Action `updateDeal` — implementado como estado local (mock), sem persistência real
- [ ] Server Action `deleteDeal` — não implementado
- [x] Reordenação de posição dentro da mesma coluna

#### Verificação
- [x] Cards aparecem na coluna correta
- [ ] Drag-and-drop move card e persiste no banco (move e reordena em memória, sem banco)
- [x] Criar novo negócio via botão na coluna
- [x] Valor total por coluna calcula corretamente

### Commit Final
```
feat: pipeline — Kanban board with drag-and-drop, deals CRUD, stage persistence
```

---

## M6 — Registro de Atividades

**Branch:** `m6/activities`
**Objetivo:** Timeline de atividades (ligação, e-mail, reunião, nota) vinculada ao lead, com histórico cronológico.

### Entregas

#### Banco de Dados
- [x] Tabela `activities` — `id`, `workspace_id`, `lead_id`, `author_id`, `type`, `description`, `activity_date`, `created_at`
- [x] Type enum: `call`, `email`, `meeting`, `note`
- [x] RLS — filtra por `workspace_id`
- [x] Índice em `lead_id`, `activity_date DESC`

#### UI — Timeline (na página de detalhe do lead)
- [x] `components/leads/activity-timeline.tsx` — lista cronológica de atividades
- [x] Item de atividade com ícone por tipo, autor, data, descrição — inline no `activity-timeline.tsx`, sem `activity-item.tsx` separado (não havia necessidade de reuso fora da timeline)
- [x] `components/leads/activity-form.tsx` — Dialog para registrar nova atividade, aberto via `new-activity-button.tsx`
- [x] Ícones por tipo: telefone (call), envelope (email), calendário (meeting), nota (note)
- [x] Formatação de data relativa ("há 2 dias", "hoje às 14h")

#### Lógica
- [x] Server Action `createActivity` em `app/(dashboard)/leads/activities-actions.ts` — recebe `{ leadId, type, description, date }`
- [x] Busca de atividades ordenada por `activity_date DESC` via `getActivities` em `lib/supabase/queries.ts`
- [x] Autor preenchido automaticamente pelo usuário logado (`author_id` = usuário da sessão, exigido pela RLS)

#### Verificação
- [x] Registrar atividade de cada tipo (call, email, meeting, note)
- [x] Timeline exibe em ordem cronológica decrescente
- [x] Autor e data exibidos corretamente (autor resolvido via `getWorkspaceMembers`, mesmo padrão do "responsável" em leads/deals)
- [x] Atividade aparece na página do lead após `router.refresh()` (revalidação via Server Action + `revalidatePath`, não otimista)

### Commit Final
```
feat: activities — timeline per lead, 4 activity types, chronological history
```

---

## M7 — Dashboard de Métricas

**Branch:** `m7/dashboard`
**Objetivo:** Página inicial do app com cards de métricas, gráfico de funil e lista de negócios com prazo próximo.

### Entregas

#### Instalação
- [x] `npm install recharts`

#### UI — Cards de Métricas (construir com dados estáticos primeiro)
- [x] `app/(dashboard)/dashboard/page.tsx` — página principal
- [x] `components/dashboard/metric-card.tsx` — card reutilizável (título, valor, ícone, variação %)
- [x] Cards: Total de Leads, Negócios Abertos, Valor Total do Pipeline, Taxa de Conversão
- [ ] Skeleton loader enquanto carrega

#### UI — Gráfico de Funil
- [x] `components/dashboard/funnel-chart.tsx` — gráfico de barras horizontais com Recharts mostrando quantidade por etapa
- [x] Cores por etapa consistentes com o Kanban

#### UI — Negócios com Prazo Próximo
- [x] `components/dashboard/upcoming-deals.tsx` — lista de até 5 negócios com prazo nos próximos 7 dias
- [x] Indicador visual se prazo está vencido (vermelho) ou próximo (amarelo)

#### Lógica (queries no banco)
- [ ] `getTotalLeads(workspaceId)` — count de leads ativos — calculado a partir de mock, sem query real
- [ ] `getOpenDeals(workspaceId)` — count de deals não fechados — calculado a partir de mock, sem query real
- [ ] `getPipelineValue(workspaceId)` — soma de `value` dos deals abertos — calculado a partir de mock, sem query real
- [ ] `getConversionRate(workspaceId)` — `won / (won + lost) * 100` — calculado a partir de mock, sem query real
- [ ] `getDealsByStage(workspaceId)` — count por stage para o funil — calculado a partir de mock, sem query real
- [ ] `getUpcomingDeals(workspaceId, userId)` — deals com deadline ≤ 7 dias — calculado a partir de mock, sem query real

#### Verificação
- [ ] Todos os cards exibem valores reais do workspace (exibem valores mock)
- [x] Gráfico de funil reflete distribuição real dos deals (mock)
- [ ] Lista de prazos mostra apenas deals do workspace ativo (sem conceito de workspace ainda)

### Commit Final
```
feat: dashboard — metrics cards, sales funnel chart, upcoming deadlines
```

---

## M8 — Convite de Colaboradores

**Branch:** `m8/invites`
**Objetivo:** Admin envia convite por e-mail; convidado cria conta (ou loga) e é adicionado ao workspace.

### Entregas

#### Banco de Dados
- [x] Tabela `workspace_invites` — `id`, `workspace_id`, `email`, `role`, `token`, `invited_by`, `accepted_at`, `expires_at`, `created_at`
- [x] RLS — apenas admin do workspace vê e cria convites

#### Instalação
- [x] `npm install resend`
- [ ] Configurar `RESEND_API_KEY` no `.env.local`

#### UI — Gestão de Membros
- [ ] `app/(dashboard)/settings/members/page.tsx` — lista de membros + form de convite
- [ ] `components/settings/members-list.tsx` — tabela com nome, e-mail, cargo, ações (remover/alterar role)
- [ ] `components/settings/invite-form.tsx` — input de e-mail + select de papel + botão "Convidar"
- [ ] Badge de convite pendente para e-mails ainda não aceitos

#### UI — Aceite do Convite
- [ ] `app/invite/[token]/page.tsx` — página pública de aceite
- [ ] Se não logado: mostrar nome do workspace + botão "Criar conta" ou "Entrar"
- [ ] Se logado: adicionar ao workspace e redirecionar

#### Lógica
- [ ] `lib/resend/emails.ts` — arquivo criado como stub (`buildInviteEmail` retorna string vazia), template ainda não implementado
- [ ] Server Action `sendInvite(email, role)` — cria registro + envia e-mail via Resend
- [ ] API Route `GET /api/invites/[token]` — valida token + adiciona membro + marca como aceito
- [ ] Expiração de convite após 7 dias

#### Verificação
- [ ] Admin envia convite → e-mail chega via Resend
- [ ] Link do convite abre página de aceite
- [ ] Após aceite, usuário aparece na lista de membros
- [ ] Convite expirado exibe mensagem de erro

### Commit Final
```
feat: invites — email invitations via Resend, invite acceptance flow, member management
```

---

## M9 — Monetização com Stripe

**Branch:** `m9/stripe`
**Objetivo:** Planos Free e Pro funcionando com checkout, webhook e portal de gerenciamento de assinatura.

### Entregas

#### Instalação
- [ ] `npm install stripe @stripe/stripe-js` — apenas `stripe` instalado, falta `@stripe/stripe-js`
- [ ] Configurar variáveis Stripe no `.env.local`
- [ ] Criar produto e preço no Stripe Dashboard (R$ 49/mês)

#### Banco de Dados
- [x] Adicionar colunas em `workspaces`: `stripe_customer_id`, `stripe_subscription_id`, `plan_status` (active/canceled/trialing)
- [ ] Atualizar RLS/checks de limite: max 2 membros e 50 leads no plano Free

#### UI — Planos e Upgrade
- [ ] `app/(dashboard)/settings/billing/page.tsx` — página de cobrança
- [ ] `components/settings/plan-card.tsx` — card mostrando plano atual, uso (leads/membros) e botão de upgrade
- [ ] `components/settings/pricing-cards.tsx` — comparação Free vs Pro
- [ ] Botão "Gerenciar Assinatura" abre Customer Portal
- [ ] Banner de limite atingido quando workspace Free chega ao limite

#### Lógica
- [x] `lib/stripe/client.ts` — instância do Stripe
- [ ] Server Action `createCheckoutSession(workspaceId)` → redireciona para Stripe Checkout
- [ ] Server Action `createPortalSession(workspaceId)` → redireciona para Customer Portal
- [ ] `app/api/stripe/webhook/route.ts` — handler de webhooks:
  - `checkout.session.completed` → atualiza `plan`, `stripe_customer_id`, `stripe_subscription_id`
  - `customer.subscription.deleted` → downgrade para free
  - `customer.subscription.updated` → atualiza status

#### Limites do Plano Free (enforcement)
- [ ] Server Action `createLead` verifica limite de 50 leads antes de inserir
- [ ] Server Action `sendInvite` verifica limite de 2 membros antes de enviar

#### Verificação
- [ ] Checkout redireciona para Stripe e volta após pagamento
- [ ] Webhook atualiza `plan` do workspace para `pro`
- [ ] Workspace Pro não tem limites de leads/membros
- [ ] Cancelamento downgrade para Free via webhook
- [ ] Customer Portal permite gerenciar assinatura

### Commit Final
```
feat: stripe — subscription plans, checkout, webhook handler, customer portal, plan limits
```

---

## M10 — Landing Page

**Branch:** `m10/landing`
**Objetivo:** Página pública de marketing com apresentação do produto, funcionalidades, preços e CTA.

### Entregas

#### UI — Seções da Landing Page
- [x] `app/(marketing)/page.tsx` — root public page
- [x] `app/(marketing)/layout.tsx` — layout sem sidebar, com nav pública
- [x] `components/marketing/nav.tsx` — barra de navegação com logo, links e botão "Entrar" / "Começar grátis"
- [x] `components/marketing/hero.tsx` — headline, subheadline, CTA primário ("Começar grátis") — sem screenshot/mockup do app
- [x] `components/marketing/features.tsx` — grid de 6 funcionalidades com ícone, título e descrição
- [x] `components/marketing/pricing.tsx` — cards Free vs Pro com lista de features e botões de ação
- [x] `components/marketing/cta.tsx` — seção final de conversão com headline + botão
- [x] `components/marketing/footer.tsx` — links e copyright

#### Qualidade Visual
- [x] Animações suaves com Tailwind `transition` e `animate-`
- [x] Gradiente sutil no hero (paleta PipeFlow Brand v2, não slate-950 → slate-900)
- [ ] Screenshot do pipeline Kanban como social proof
- [x] Responsivo: mobile-first, breakpoints sm/md/lg

#### SEO Básico
- [x] `metadata` com title, description e og:image em `app/(marketing)/layout.tsx`
- [ ] `sitemap.ts` com rota pública

#### Verificação
- [x] Landing carrega em `/` sem autenticação
- [x] CTAs direcionam para `/signup`
- [ ] Preços exibem valores corretos alinhados com Stripe (M9 ainda não implementado)
- [x] Layout responsivo funciona em mobile

### Commit Final
```
feat: landing page — hero, features, pricing, CTA, responsive layout
```

---

## M11 — Deploy & Produção

**Branch:** `develop` → `main`
**Objetivo:** App rodando em produção no Vercel + Supabase com domínio, variáveis de ambiente e monitoramento básico.

### Entregas

#### Supabase Produção
- [ ] Criar projeto Supabase de produção (separado do dev)
- [ ] Rodar todas as migrations de schema no projeto de prod
- [ ] Configurar RLS policies em prod
- [ ] Habilitar confirmação de e-mail no Supabase Auth

#### Vercel
- [ ] Conectar repositório GitHub ao Vercel
- [ ] Configurar todas as variáveis de ambiente no painel do Vercel
- [ ] Branch `main` = deploy de produção, `develop` = preview
- [ ] Configurar domínio customizado (ex: `app.pipeflow.com.br`)

#### Stripe Produção
- [ ] Criar produto e preço no Stripe em modo produção (live keys)
- [ ] Registrar webhook endpoint de produção: `https://app.pipeflow.com.br/api/stripe/webhook`
- [ ] Atualizar `STRIPE_PRO_PRICE_ID` com ID do produto live

#### Resend Produção
- [ ] Verificar domínio de envio no Resend (`no-reply@pipeflow.com.br`)
- [ ] Atualizar `RESEND_API_KEY` com chave de produção

#### Checklist Final
- [ ] `npm run build` sem erros TypeScript
- [ ] Todas as rotas carregam em produção
- [ ] Login, cadastro e reset de senha funcionam
- [ ] Criar workspace, lead e deal funcionam
- [ ] Kanban drag-and-drop persiste
- [ ] Checkout Stripe com cartão de teste (modo live desativado até validar)
- [ ] E-mail de convite chega via Resend

### Commit Final
```
chore: production deploy — Vercel config, env vars, Supabase prod, Stripe live setup
```

---

## Resumo dos Milestones

| # | Milestone | Branch | Foco |
|---|-----------|--------|------|
| M1 | Setup & Fundação | `m1/setup` | Projeto, layout, tipos |
| M2 | Autenticação | `m2/auth-ui` | Login/signup/reset |
| M3 | Workspaces | `m3/workspaces` | Multi-empresa, RLS |
| M4 | Leads | `m4/leads` | CRUD, filtros, detalhe |
| M5 | Pipeline Kanban | `m5/pipeline` | Drag-and-drop, deals |
| M6 | Atividades | `m6/activities` | Timeline por lead |
| M7 | Dashboard | `m7/dashboard` | Métricas, gráfico funil |
| M8 | Convites | `m8/invites` | Resend, aceite de convite |
| M9 | Stripe | `m9/stripe` | Planos, checkout, webhooks |
| M10 | Landing Page | `m10/landing` | Marketing, SEO |
| M11 | Deploy | `develop` → `main` | Produção |

> **Regra:** Nunca avançar para o próximo milestone com o anterior quebrado. Cada entrega deve ser testável de forma isolada.
