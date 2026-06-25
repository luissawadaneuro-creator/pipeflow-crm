# PRD — PipeFlow CRM

## 1. Problema Identificado

Pequenas e médias empresas, freelancers e times de vendas perdem oportunidades de negócio por falta de organização no processo comercial. Leads são gerenciados em planilhas, anotações soltas ou ferramentas genéricas que não oferecem visão clara do funil de vendas.

Não há registro centralizado de interações com clientes, e quando a equipe cresce, os dados ficam espalhados sem controle de acesso por empresa/time.

Soluções como HubSpot e Pipedrive existem, mas são caras ou complexas demais para quem está começando.

---

## 2. Solução Proposta

Construir o **PipeFlow CRM** — uma plataforma SaaS de gestão de clientes e vendas, multi-empresa com pipeline visual Kanban, gestão completa de leads e negócios, registro de interações e integração de pagamento para monetização.

- CRM completo com cadastro de leads/contatos (nome, e-mail, telefone, empresa, cargo)
- Pipeline Kanban de vendas com drag-and-drop entre etapas
- Página de detalhe do lead com histórico completo de atividades
- Sistema multi-empresa com convite de colaboradores por e-mail
- Dashboard com métricas de vendas e gráfico de funil
- Monetização via planos de assinatura
- Landing page de apresentação do produto

---

## 3. Requisitos Funcionais

### Autenticação
- Login e cadastro com e-mail/senha via Supabase Auth
- Recuperação de senha por e-mail

### Gestão de Leads e Contatos
- Cadastro completo: nome, e-mail, telefone, empresa, cargo, status
- Listagem com busca e filtros (por status, responsável, data)
- Página de detalhe com perfil completo e timeline de atividades

### Pipeline Kanban de Vendas

Colunas por etapa:
1. Novo Lead
2. Contato Realizado
3. Proposta Enviada
4. Negociação
5. Fechado Ganho
6. Fechado Perdido

Cards de negócios com:
- Título
- Valor estimado (R$)
- Lead vinculado
- Responsável
- Prazo próximo

Drag-and-drop entre etapas com persistência no banco.

### Registro de Atividades

Tipos:
- Ligação
- E-mail
- Reunião
- Nota

Campos:
- Autor
- Descrição
- Data

Timeline cronológica vinculada ao lead.

### Dashboard de Métricas

Cards:
- Total de leads
- Negócios abertos
- Valor total do pipeline
- Taxa de conversão

Gráfico de funil de vendas (Recharts). Negócios do usuário logado com prazo próximo.

### Multi-empresa e Colaboração
- Criar workspaces (cada empresa/time = 1 workspace)
- Convite de colaboradores por e-mail (com Resend)
- Papéis:
  - **Admin** — acesso total
  - **Membro** — leads e negócios
- Alternar entre workspaces via dropdown na sidebar
- Isolamento de dados via Row Level Security (RLS) no Supabase

### Monetização (Stripe)

| Plano | Colaboradores | Leads | Preço |
|-------|---------------|-------|-------|
| Free  | até 2         | até 50 | Gratuito |
| Pro   | Ilimitados    | Ilimitados | R$ 49/mês |

- Checkout integrado via Stripe Checkout
- Webhook para ativar/desativar plano automaticamente
- Customer Portal do Stripe para gerenciamento de assinatura

### Landing Page

Página pública de apresentação do PipeFlow CRM com seções:
- Hero
- Funcionalidades
- Planos e preços
- CTA

---

## 4. Personas

### Dono do Negócio / Empreendedor (Admin)
Pequeno empresário que precisa organizar seu processo de vendas. Cria o workspace, convida o time, gerencia planos e possui acesso completo às funcionalidades.

### Vendedor / Colaborador (Membro)
Profissional de vendas que utiliza o CRM no dia a dia. Cadastra leads, move negócios no pipeline e registra atividades. Pode participar de múltiplos workspaces.

### Freelancer / Consultor (Admin Solo)
Profissional independente que atende vários clientes. Utiliza workspaces separados para cada cliente/projeto. Começa no plano Free e faz upgrade conforme cresce.

---

## 5. Stack Técnica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes + Server Components |
| Banco de Dados | Supabase (PostgreSQL + RLS) |
| Autenticação | Supabase Auth |
| Pagamento | Stripe (Checkout + Webhooks + Customer Portal) |
| E-mail | Resend |
| Drag-and-drop | @dnd-kit |
| Gráficos | Recharts |
| Linguagem | TypeScript 5 |
| Deploy | Vercel + Supabase |
| Versionamento | Git + GitHub |

---

## 6. Design Language

### Referências
- **HubSpot CRM** — CRM gratuito mais popular. Insight: simplificar a experiência focando apenas em vendas.
- **Pipedrive** — CRM focado em vendas com pipeline visual excelente. Insight: modelo freemium acessível.

### Diretrizes Visuais
- Interface limpa, profissional, dark-friendly
- Sidebar fixa com navegação principal
- Cards com sombra suave e bordas arredondadas (rounded-xl)
- Paleta primária: azul (blue-600) com neutros slate
- Tipografia clara, hierarquia visual consistente
- Estados de loading com skeleton loaders
- Feedback de ações com toasts (sonner)

---

## 7. Processo de Desenvolvimento

- Dividir o build em milestones lógicos e entregáveis
- Priorizar funcionalidade core primeiro, depois iterar
- Testar cada milestone antes de avançar

### Milestones

1. **M1** — Setup do projeto (Next.js + Tailwind + shadcn + Supabase)
2. **M2** — Autenticação (login, cadastro, reset de senha)
3. **M3** — Workspaces e multi-empresa
4. **M4** — Gestão de Leads (CRUD + busca + filtros)
5. **M5** — Pipeline Kanban (drag-and-drop + persistência)
6. **M6** — Registro de Atividades (timeline por lead)
7. **M7** — Dashboard de Métricas (cards + funil)
8. **M8** — Convite de colaboradores (Resend)
9. **M9** — Monetização Stripe (planos + checkout + webhook)
10. **M10** — Landing Page pública
