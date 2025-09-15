# Copilot Instructions for masterconstrutora_v2

This guide enables AI coding agents to work productively in this codebase. It summarizes architecture, workflows, and conventions unique to this project.

## Project Overview

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS, shadcn/ui
- **Forms:** React Hook Form + Zod
- **Auth:** Custom JWT sessions, middleware-protected routes
- **API:** External backend via service layer
- **State:** React Server Components, Server Actions

## Directory Structure

- `app/` — Pages, server actions, API routes, dashboard modules
- `components/` — UI and form components (shadcn/ui, custom)
- `services/` — API service layer (fetch, error handling)
- `types/` — TypeScript types for all entities
- `lib/` — Utilities, session/auth logic, API config
- `public/` — Static assets

## Data Flow

1. **Pages** (Server Components) fetch initial data
2. **Client Components** handle UI and forms
3. **Server Actions** (`app/actions/`) process mutations
4. **Services** (`services/`) communicate with backend
5. **Types** (`types/`) define shared interfaces

## Authentication

- JWT stored in HTTP-only cookies
- `middleware.ts` enforces route protection
- Public: `/`, `/login`; Protected: `/dashboard/*`

## Component Patterns

- **Page Components:** Server Components for data
- **Client Components:** Suffix `Client` (e.g., `FornecedoresPageClient.tsx`)
- **Forms:** React Hook Form + Zod
- **UI:** shadcn/ui library

## Entity Management

- Core entities: Funcionários, Fornecedores, Materiais, Obras, Orçamentos, Clientes
- See `entities.md` for full data model

## API & Services

- All API calls via `services/` using `fetch`
- API config: `lib/api-config.ts`
- Revalidation: `app/api/revalidate/route.ts`

## Developer Workflows

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Start:** `npm run start`
- **Lint:** `npm run lint`
- **Tests:** Vitest (see `vitest.config.ts`)
- **Package manager:** pnpm

## Conventions & Notes

- ESLint/TypeScript errors ignored during dev builds
- Images unoptimized for deployment flexibility
- Theme switching via next-themes
- Use TypeScript types from `types/` for all entities
- Prefer Server Actions for mutations, services for API fetches

## Key Files

- `entities.md` — Data model reference
- `middleware.ts` — Auth logic
- `app/dashboard/layout.tsx` — Main layout
- `lib/session.ts` — JWT/session management
- `services/index.ts` — API service exports

---

For unclear patterns or missing details, ask the user for clarification or examples from the codebase.
