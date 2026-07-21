# Security policy

Report vulnerabilities privately through GitHub Security Advisories. Do not open a public issue
containing exploit details, credentials, session material or user data.

Supported releases receive dependency and application-security fixes on the latest `2.x` release
line. Security-sensitive mutations require a database-validated session, workspace membership and
an application permission check.

## Historical credential notice

An early repository commit contains non-empty MongoDB, Cloudinary and Gemini environment values.
The values are not used by AutoBlog 2.x and must be rotated or revoked by their provider account
owner. Shared history is intentionally not rewritten.
