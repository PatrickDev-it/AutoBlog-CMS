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
| `/api/health` | GET | public | readiness without secret details |

Stable application codes are `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`,
`VALIDATION_FAILED`, `VERSION_CONFLICT`, `ILLEGAL_TRANSITION`, `QUOTA_EXCEEDED`,
`RATE_LIMITED`, `PROVIDER_UNAVAILABLE` and `INTERNAL_FAILURE`.
