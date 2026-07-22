# Security policy

Report vulnerabilities privately through GitHub Security Advisories. Do not open a public issue
containing exploit details, credentials, session material or user data.

Supported releases receive dependency and application-security fixes on the latest `2.x` release
line. Security-sensitive mutations require a database-validated session, workspace membership and
an application permission check. Stable public errors include a correlation ID and exclude stack,
database and provider details.

## Operational requirements

- Use unique production values for `BETTER_AUTH_SECRET` and `CRON_SECRET`; never reuse a provider key.
- Use HTTPS and a durable remote libSQL database for serverless deployment.
- Invoke the leased job runner at least once per minute and alert on repeated failures.
- Keep `AI_MODE=mock` unless the operator has accepted provider data-processing and billing terms.
- Run `bun run audit`, `bun run security:secrets` and the full-history CI scan before release.
- Back up the database before schema deployment; applied migrations are checksum protected.

The detailed assets, trust boundaries, mitigations and residual risks are in
[docs/security-threat-model.md](./docs/security-threat-model.md).

## Historical credential notice

An early repository commit contains non-empty MongoDB, Cloudinary and Gemini environment values.
The values are not used by AutoBlog 2.x and must be rotated or revoked by their provider account
owner. Shared history is intentionally not rewritten.
