# HóaLab architecture

HóaLab v2 is a modular Next.js application. Frontend, backend boundaries and PostgreSQL files live in separate top-level folders while being deployed as one application.

```text
app/                          Next.js entry points and thin HTTP controllers
backend/
  modules/auth/               Session, profile bootstrap and role checks
  modules/admin/              Admin request guard
database/
  client.ts                   PostgreSQL connection pool
  schema.ts                   Drizzle schema
  migrations/                 PostgreSQL migrations
  legacy-d1-migrations/       Read-only archive from the old prototype
frontend/
  components/
    atoms/                    Chemistry notation and progress primitives
    molecules/                Small reusable compositions
    organisms/                Header and sidebar
    templates/                Student and admin application shells
  features/
    auth/                     Login UI and client auth state
    admin/                    Video, checkpoint, folder, question and exam editors
    dashboard/                Personal overview
    hubs/                     Grade libraries, practice library and virtual lab
    learning/                 Interactive video lesson and grading UI
    ai/                       Chemistry assistant workspace
    tools/                    Chemistry utilities
  styles/                     Global design tokens
shared/                       Framework-independent contracts and validators
```

## Dependency direction

```text
app → frontend
app → backend
app → database
backend → database
frontend → shared
backend → shared
database → shared
```

- Frontend code must not import database or backend modules.
- API routes authenticate requests, validate HTTP input and call backend services.
- Backend modules own business rules and repositories.
- Database files contain persistence details only.
- Shared contracts must not import React, Next.js or database drivers.

## PostgreSQL

Local development uses PostgreSQL 17 with database `hoalab_dev`. Drizzle generates migrations in `database/migrations`.

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
```

The application stores video URLs and metadata in PostgreSQL. Video binaries should be uploaded to object storage such as Vercel Blob or S3, never stored directly in a table.

## Authentication

Development accounts are provided by the local credential adapter in `backend/modules/auth/session.ts`. Sessions are signed and stored in an HttpOnly cookie. Every `/api/admin/*` handler repeats the admin role check on the server.

Before public deployment, replace the credential adapter with Auth.js, Supabase Auth or another identity provider. The frontend auth context does not need to change when the server session contract is preserved.

## Current migration stage

The folder and database separation is complete. The next refactor phase moves remaining exam, lesson, progress and AI business logic out of `app/api` into `backend/modules/*`; API routes will remain as thin controllers.
