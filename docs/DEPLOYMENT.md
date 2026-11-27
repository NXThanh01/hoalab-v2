# HóaLab deployment paths

## Local development

```bash
npm install
npm run db:migrate
npm run build
npm run dev
```

Open `http://127.0.0.1:5173`.

When no `.env.local` is present, development mode exposes two local-only accounts:

- Student: `student@hoalab.local` / `Student@123`
- Admin: `admin@hoalab.local` / `Admin@123`

These fallback accounts are disabled by production builds. Copy `.env.example` to `.env.local` and replace every credential before sharing the app.

## Custom domain or Vercel

The UI, role-based entry flow and API contracts are portable. Before deploying publicly:

1. Configure all `HOALAB_*` environment variables in the hosting dashboard.
2. Create a hosted PostgreSQL database and set `DATABASE_URL`.
3. Run `npm run db:migrate` against the production database and enable backups.
4. Configure `OPENAI_API_KEY` server-side if live AI responses are required.
5. Add the custom domain in the hosting provider and update DNS only after the deployment passes checks.

### Admin video uploads

Connect a **private Vercel Blob** store to the project environment. The app accepts Vercel's Blob OIDC configuration (`BLOB_STORE_ID`) or `BLOB_READ_WRITE_TOKEN`. For local testing, use a separate development store, or enter a direct HTTPS video URL in Admin Studio.

Administrators can upload MP4/WebM files up to 100 MB, add checkpoints, and then save a draft or publish. Published private videos are served to signed-in learners with expiring URLs.

For a larger user base, use Supabase Auth or Auth.js instead of environment-defined accounts. `backend/modules/auth/session.ts` is the authentication boundary that needs to be replaced.
