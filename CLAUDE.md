# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Architecture

This is a Next.js 15 construction management application for "Master Construtora" using the App Router with TypeScript and Tailwind CSS.

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Custom JWT session management with middleware
- **Database**: API-based (external backend)
- **State Management**: React Server Components with Server Actions

### Project Structure

```
app/
├── actions/           # Server Actions for data mutations
├── api/              # API routes
├── dashboard/        # Main application pages
│   ├── fornecedores/ # Suppliers management
│   ├── funcionarios/ # Employees management  
│   ├── materiais/    # Materials management
│   ├── obras/        # Construction projects
│   ├── orcamentos/   # Budgets/quotes
│   └── financeiro/   # Financial management
├── lib/              # Utility functions and configurations
└── login/            # Authentication pages

components/
├── ui/               # shadcn/ui components
└── data-table/       # Reusable data table components

services/             # API service layer
types/               # TypeScript type definitions
```

### Data Flow Pattern

1. **Pages** use Server Components for initial data fetching
2. **Client Components** handle user interactions and forms
3. **Server Actions** (in `app/actions/`) handle form submissions and data mutations
4. **Services** (in `services/`) manage API communication with external backend
5. **Types** (in `types/`) define shared TypeScript interfaces

### Authentication Flow

- Uses JWT sessions stored in HTTP-only cookies
- Middleware in `middleware.ts` protects dashboard routes
- Public routes: `/`, `/login`
- Protected routes: everything under `/dashboard`

### Component Patterns

- **Page Components**: Server Components that fetch initial data
- **Client Components**: Suffix with "Client" (e.g., `FornecedoresPageClient.tsx`)
- **Form Components**: Use React Hook Form with Zod schemas
- **UI Components**: Leverage shadcn/ui component library

### Entity Management

The application manages these core entities (detailed in `entities.md`):
- Funcionários (Employees)
- Fornecedores (Suppliers) 
- Materiais (Materials)
- Obras (Construction Projects)
- Orçamentos (Budgets/Quotes)
- Clientes (Clients)

### API Communication

- Services use `fetch` with proper error handling
- API configuration in `app/lib/api-config.ts`
- Revalidation handled via `app/api/revalidate/route.ts`

### Development Notes

- ESLint and TypeScript errors are ignored during builds (development setting)
- Images are unoptimized (likely for deployment flexibility)
- Uses pnpm as package manager (evidenced by pnpm-lock.yaml)
- Theme switching supported via next-themes

## Important Files to Understand

- `entities.md` - Complete data model and entity relationships
- `middleware.ts` - Authentication and route protection
- `app/dashboard/layout.tsx` - Main navigation and layout structure
- `app/lib/session.ts` - JWT session management
- `services/index.ts` - API service exports