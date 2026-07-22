# Authentication and RBAC

Better Auth issues 12-hour database sessions in signed, HTTP-only, SameSite=Lax cookies. Production
requires a unique 32+ character secret and HTTPS enables Secure cookies. Sign-up is disabled;
bounded demo accounts are installed by the validated seed. Sign-out deletes the session, and login
and logout append workspace audit events. Authentication rate limits persist in libSQL.

Every custom mutation first validates the session and requested membership, then verifies the
request origin, then executes the application permission. Workspace identity is never read from a
JSON payload.

| Command | Owner | Admin | Editor | Author | Reviewer |
| --- | --- | --- | --- | --- | --- |
| Read workspace | Allow | Allow | Allow | Allow | Allow |
| Create post | Allow | Allow | Allow | Allow | Deny |
| Update/submit/restore own post | Allow | Allow | Allow | Allow own | Deny |
| Delete post | Allow | Allow | Allow | Deny | Deny |
| Request changes / approve | Allow | Allow | Allow | Deny | Allow |
| Schedule / publish / archive | Allow | Allow | Allow | Deny | Deny |
| Upload media | Allow | Allow | Allow | Allow own | Deny |
| Delete media | Allow | Allow | Allow | Deny | Deny |
| Request AI suggestion | Allow | Allow | Allow | Allow | Allow |
| Manage membership | Allow | Allow | Deny | Deny | Deny |
| Reset bounded demo | Allow | Deny | Deny | Deny | Deny |
| Run jobs manually | Allow | Allow | Deny | Deny | Deny |

`tests/unit/rbac-policy.test.ts` evaluates every role/command pair and explicitly verifies Author
ownership denial. Integration and E2E tests verify arbitrary credentials, revocation, Reviewer
denial, anonymous denial and cross-workspace isolation.
