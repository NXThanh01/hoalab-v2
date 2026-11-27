# HóaLab deployment paths

## Local development

```bash
npm install
npm run db:migrate
npm run build
npm run dev
```

Open `http://127.0.0.1:5173`.

### Authentication setup

Set `DATABASE_URL` and a random `HOALAB_SESSION_SECRET` of at least 32 bytes. Local development supplies a development-only session key if none is configured. Run the migration followed by `npm run db:seed:auth` with `HOALAB_ADMIN_PASSWORD` set in the command environment or an ignored local env file. The default admin login ID is `admin@hoalab.local`; set `HOALAB_ADMIN_EMAIL` to choose another. The optional student seed uses `HOALAB_STUDENT_EMAIL` and `HOALAB_STUDENT_PASSWORD`. Choose passwords of 15–128 characters.

The seed looks up existing profiles by their login email to retain learning and exam history. It never replaces an existing password. If the previous admin and student should retain their data, use their existing login IDs for the first seed. Password seed inputs are only needed when creating those account rows. Keep them out of Git and remove any obsolete environment passwords from the host after cutover and verification.

Remembered sessions expire after 30 days. Browser-session cookies expire server-side after 12 hours. An admin reset revokes all old sessions and creates a temporary password valid for 24 hours. A session opened with a temporary password can only change the password or sign out and expires after 15 minutes. The login limiter allows five attempts per login ID and 60 per trusted source bucket in a 15-minute window.

## Custom domain or Vercel

The UI, role-based entry flow and API contracts are portable. Before deploying publicly:

1. Configure a production `HOALAB_SESSION_SECRET` and `DATABASE_URL` in the hosting dashboard.
2. Back up the database and apply the migrations before deploying the new auth code.
3. Seed production accounts by running `npm run db:seed:auth -- --allow-remote` with an explicitly selected production connection and secure seed credentials. Check that the expected admin and user rows exist before switching traffic. Cookies from the earlier implementation will expire at cutover, so users must sign in again.
4. Configure `GEMINI_API_KEY` for Trợ lý Hóa and optionally `GEMINI_MODEL` to override the default. `OPENAI_API_KEY` is used separately for AI grading. Set these as server-side variables.
5. Add the custom domain in the hosting provider and update DNS only after the deployment passes checks.

### Ester – Lipid games

The four game modes read the 150 questions attached to the three published Ester – Lipid quizzes in PostgreSQL. When moving the demo to a new database, transfer the folder, questions, quizzes and quiz-question links with their IDs intact. A code deployment alone leaves the game bank empty on a fresh database.

### Admin video uploads

Connect a **private Vercel Blob** store to the project environment. The app accepts Vercel's Blob OIDC configuration (`BLOB_STORE_ID`) or `BLOB_READ_WRITE_TOKEN`. For local testing, use a separate development store, or enter a direct HTTPS video URL in Admin Studio.

Administrators can upload MP4/WebM files up to 100 MB, add checkpoints, and then save a draft or publish. Published private videos are served to signed-in learners with expiring URLs.

The app verifies JWT claims with `jose` and checks each session and the current account status in PostgreSQL. Passwords are hashed with Argon2id. Production cookies are HttpOnly, Secure and SameSite=Lax.
