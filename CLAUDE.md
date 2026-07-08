# CLAUDE.md — PipeFlow CRM

## Project Overview

**PipeFlow CRM** is a multi-tenant SaaS CRM platform for SMBs, freelancers, and sales teams. It provides a visual Kanban sales pipeline, lead management, activity tracking, team collaboration via workspaces, and Stripe-based subscription monetization.

Full requirements: [`docs/PRD.md`](docs/PRD.md)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI Library | React 18 |
| Styling | Tailwind CSS v3 |
| Components | shadcn/ui |
| Database + Auth | Supabase (PostgreSQL + RLS + Auth) |
| Payments | Stripe (Checkout, Webhooks, Customer Portal) |
| Email | Resend |
| Drag-and-drop | @dnd-kit/core + @dnd-kit/sortable |
| Charts | Recharts |
| Toasts | sonner |
| Language | TypeScript 5 (strict mode) |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## Folder Structure

```
/
├── app/
│   ├── (auth)/                  # Public auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/             # Protected app routes (middleware guarded)
│   │   ├── dashboard/           # Metrics overview
│   │   ├── leads/               # Lead list + detail pages
│   │   │   └── [id]/
│   │   ├── pipeline/            # Kanban board
│   │   ├── settings/            # Workspace & account settings
│   │   └── workspace/           # Workspace switcher / creation
│   ├── (marketing)/             # Public landing page
│   │   └── page.tsx
│   └── api/
│       ├── stripe/
│       │   └── webhook/         # Stripe webhook handler
│       └── invites/             # Workspace invite endpoints
├── components/
│   ├── ui/                      # shadcn/ui primitives (auto-generated)
│   ├── leads/                   # LeadCard, LeadForm, LeadTimeline
│   ├── pipeline/                # KanbanBoard, KanbanColumn, DealCard
│   ├── dashboard/               # MetricCard, FunnelChart
│   └── shared/                  # Sidebar, Header, WorkspaceSwitcher
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Browser client
│   │   ├── server.ts            # Server component client
│   │   └── middleware.ts        # Auth session refresh
│   ├── stripe/
│   │   ├── client.ts
│   │   └── webhooks.ts
│   └── resend/
│       └── emails.ts
├── types/
│   └── index.ts                 # Global domain types
├── middleware.ts                 # Route protection
├── docs/
│   └── PRD.md
└── CLAUDE.md
```

---

## Coding Conventions

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` — use `unknown` and narrow with type guards
- Define domain types in `types/index.ts`, co-locate component-specific types

### React / Next.js
- Default to **Server Components**; add `"use client"` only when needed (interactivity, hooks, browser APIs)
- Data fetching in Server Components via Supabase server client
- Mutations via Server Actions or API Routes
- No `useEffect` for data fetching — use Server Components or SWR/React Query if needed client-side

### File Naming
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `useHookName.ts`
- Utilities: `camelCase.ts`

### Component Pattern
```tsx
// components/leads/lead-card.tsx
interface LeadCardProps {
  lead: Lead
  onEdit?: (id: string) => void
}

export function LeadCard({ lead, onEdit }: LeadCardProps) {
  // ...
}
```

### Imports
- Use `@/` path alias for all internal imports
- Group: external libs → internal lib → components → types

---

## Design Language

### Palette
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `blue-600` | CTAs, active states, links |
| Background | `slate-950` | App background (dark) |
| Surface | `slate-900` | Cards, sidebar |
| Border | `slate-800` | Dividers, card borders |
| Text primary | `slate-100` | Headings |
| Text muted | `slate-400` | Labels, secondary text |
| Success | `emerald-500` | Fechado Ganho, positive metrics |
| Danger | `red-500` | Fechado Perdido, errors |

### Component Style
- Cards: `rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm`
- Buttons: shadcn/ui `Button` with `variant="default"` (primary) or `variant="outline"`
- Inputs: shadcn/ui `Input` with consistent label spacing
- Skeleton loaders for all async content
- Toasts via `sonner` for action feedback

### Layout
- Fixed sidebar (240px) with workspace switcher at top and nav links
- Main content area with top header (breadcrumb + user menu)
- Responsive: sidebar collapses to icon-only on md, hidden on mobile

---

## Key Domain Concepts

| Concept | Description |
|---------|-------------|
| `Workspace` | An isolated org/team. All data is scoped to a workspace via RLS. |
| `Lead` | A contact/prospect (name, email, phone, company, role, status). |
| `Deal` | A sales opportunity linked to a Lead with a value, stage, and deadline. |
| `Stage` | One of 6 pipeline stages: Novo Lead → Fechado Ganho/Perdido. |
| `Activity` | A logged interaction (call, email, meeting, note) tied to a Lead. |
| `Member` | A user belonging to a workspace with role Admin or Membro. |

---

## External Services

### Supabase
- Auth: email/password via `supabase.auth`
- RLS: every table has policies filtering by `workspace_id` and user membership
- Storage: not used in v1

### Stripe
- Products: Free (default) and Pro (R$49/mês)
- Checkout: `stripe.checkout.sessions.create` triggered from `/api/stripe/checkout`
- Webhook: `/api/stripe/webhook` handles `checkout.session.completed` and `customer.subscription.deleted`
- Customer Portal: allow users to manage their own subscription

### Resend
- Workspace invite emails sent from `no-reply@pipeflow.app`
- Template in `lib/resend/emails.ts`

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Development Milestones

| # | Milestone | Description | Status |
|---|-----------|-------------|--------|
| M1 | Setup | Next.js + Tailwind + shadcn/ui + Supabase init | ✅ Done |
| M1.5 | App Shell | Sidebar responsiva, header, workspace switcher, dark mode | ✅ Done |
| M2 | Auth | Login, signup, reset-password, middleware | ⏳ Pending |
| M3 | Workspaces | Create, switch, RLS setup | ⏳ Pending |
| M4 | Leads | CRUD, list with filters, detail page | ✅ Done |
| M5 | Pipeline | Kanban board with drag-and-drop | ✅ Done |
| M6 | Activities | Timeline per lead (call/email/meeting/note) | ✅ Done |
| M7 | Dashboard | Metrics cards + funnel chart | ⏳ Pending |
| M8 | Invites | Email invites via Resend | ⏳ Pending |
| M9 | Stripe | Plans, checkout, webhook, portal | ⏳ Pending |
| M10 | Landing | Public marketing page | ⏳ Pending |

Work through milestones in order. Complete and test each before advancing.
