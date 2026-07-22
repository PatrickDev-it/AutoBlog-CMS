# Deployment runbook

## Supported shape

Deploy the Next.js modular monolith with a durable remote libSQL-compatible database and an external
scheduler that calls the protected job adapter at least once per minute. A local `file:` database is
valid for development and CI, not for ephemeral/serverless production storage.

Required production configuration:

```text
NEXT_PUBLIC_APP_URL=https://your-canonical-origin.example
DATABASE_URL=libsql://your-database.example
DATABASE_AUTH_TOKEN=<secret>
BETTER_AUTH_SECRET=<unique random 32+ characters>
DEMO_ENABLED=true|false
AI_MODE=mock|gemini
GEMINI_API_KEY=<secret only when gemini>
GEMINI_MODEL=gemini-2.5-flash
CRON_SECRET=<distinct random 24+ characters>
AI_MONTHLY_CHARACTER_QUOTA=200000
MEDIA_MAX_BYTES=5242880
AUTH_SIGN_IN_RATE_LIMIT=8
```

Never copy example values into production. `NEXT_PUBLIC_APP_URL` must exactly match the public HTTPS
origin used by browsers or origin validation and session cookies will fail.

## Release procedure

1. Rotate/revoke all historical provider values identified in `SECURITY.md`.
2. Create a database backup or restore point.
3. Configure secrets in the deployment platform; do not place them in GitHub logs or source.
4. Run `bun install --frozen-lockfile`, `bun run db:migrate`, `bun run build`.
5. Deploy the immutable commit and call `GET /api/health`; require HTTP 200.
6. Configure the scheduler to `POST /api/jobs/run` with header
   `x-autoblog-cron-secret: <CRON_SECRET>` at least once per minute.
7. From a clean browser, execute the Author → Reviewer → Editor → public-preview path.
8. Verify anonymous mutation denial, demo reset isolation and public preview after reload.

The scheduler accepts no job/workspace payload. Each invocation claims a bounded due batch; leases,
idempotency keys and retry state live in libSQL.

## Vercel notes

The repository can be connected to Vercel, but AutoBlog does not enable or assume a paid plan. Use a
remote database; do not rely on Vercel's ephemeral filesystem. Configure a scheduler only when the
existing account tier supports the required cadence, otherwise use an already-authorized external
scheduler. Provider/account creation is outside this repository.

## Verification and rollback

Record the commit SHA, deployment URL, migration result, health request ID and clean-session E2E
result in release notes. For any failure, stop the scheduler and follow
[rollback-recovery.md](./rollback-recovery.md).
