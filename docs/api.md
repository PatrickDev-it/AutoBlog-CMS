# API contract

Protected application routes use the envelope `{ "data": ... }`. Failures use:

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "A newer version exists. Reload or compare before saving.",
    "requestId": "correlation-id"
  }
}
```

The `x-request-id` response header mirrors the correlation ID. Stack traces, SQL/provider messages
and credentials are diagnostic-only and are never returned.

| Endpoint | Method | Permission | Success |
| --- | --- | --- | --- |
| `/api/auth/[...all]` | Better Auth GET/POST | public/session | session contract; stable error code + request ID |
| `/api/workspaces/:workspaceId/posts` | GET | `workspace.read` | post summaries |
| `/api/workspaces/:workspaceId/posts` | POST | `post.create` | revision-backed post, HTTP 201 |
| `/api/workspaces/:workspaceId/posts/:postId` | GET | `workspace.read` | current draft revision |
| `/api/workspaces/:workspaceId/posts/:postId` | PATCH | `post.update` | new immutable revision or HTTP 409 |
| `/api/workspaces/:workspaceId/posts/:postId/revisions` | GET | `workspace.read` | immutable history, newest first |
| `/api/workspaces/:workspaceId/posts/:postId/revisions/restore` | POST | `revision.restore` | restored content as a new revision |
| `/api/workspaces/:workspaceId/posts/:postId/transitions` | POST | action-specific policy | versioned workflow result |
| `/api/workspaces/:workspaceId/media?postId=…` | GET | `workspace.read` | active workspace/post asset |
| `/api/workspaces/:workspaceId/media` | POST multipart | `media.upload` + ownership | decoded and activated asset |
| `/api/workspaces/:workspaceId/media/:assetId` | GET | `workspace.read` | private verified bytes |
| `/api/workspaces/:workspaceId/media/:assetId` | DELETE | `media.delete` | logical deletion + cleanup job |
| `/api/workspaces/:workspaceId/ai/suggest` | POST | `ai.suggest` | labeled, metered suggestion only |
| `/api/workspaces/:workspaceId/demo/reset` | POST | Owner + demo guard | idempotent bounded fixture result |
| `/api/jobs/run` | POST | `jobs.run` or scheduler secret | bounded publication/media execution results |
| `/preview/:workspaceSlug/:postSlug` | GET | public | immutable published revision or 404 |
| `/api/health` | GET | public | readiness without secret details |

Mutation adapters require a trusted `Origin` in addition to the HTTP-only session cookie. Workspace
and actor identity are always derived from that session; neither is accepted from JSON payloads.
The scheduler adapter instead uses the distinct `x-autoblog-cron-secret`, compared by SHA-256 digest
with constant-time equality; it never accepts workspace/job payloads from the caller.
Application JSON responses are `private, no-store`; this does not alter static marketing or explicit
public-preview revalidation.

Stable application codes are `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`,
`VALIDATION_FAILED`, `VERSION_CONFLICT`, `ILLEGAL_TRANSITION`, `QUOTA_EXCEEDED`,
`RATE_LIMITED`, `PROVIDER_UNAVAILABLE` and `INTERNAL_FAILURE`.
