# Editorial workflow and publication

## State machine

| Command | From | To | Authorized roles | Preconditions |
| --- | --- | --- | --- | --- |
| Submit | Draft, Changes Requested | In Review | Owner, Admin, Editor, owning Author | non-empty immutable draft revision |
| Request changes | In Review | Changes Requested | Owner, Admin, Editor, Reviewer | current expected version |
| Approve | In Review | Approved | Owner, Admin, Editor, Reviewer | current expected version |
| Schedule | Approved | Scheduled | Owner, Admin, Editor | future ISO timestamp and idempotency key |
| Publish | Approved, Scheduled | Published | Owner, Admin, Editor | idempotency key and current draft revision |
| Archive | any non-archived state | Archived | Owner, Admin, Editor | current expected version |

Every transition is checked in the application service and again against state/version in the
repository transaction. Illegal transitions return `ILLEGAL_TRANSITION`; stale commands return
`VERSION_CONFLICT`. Audit rows record actor, request ID, source/destination and revision pointer.

Content is locked during review, approval and scheduling. Editing or restoring a Published post
opens a new Draft revision but does not change `published_revision_id`. Public preview therefore
continues to render the reviewed artifact until another explicit publication.

## Revision behavior

- Autosave is debounced by 850 ms and serializes in-flight writes.
- Each successful content save appends a row; database triggers reject revision updates.
- History is workspace scoped and newest-first. Compare never mutates state.
- Restore copies an old revision into a new row with `restored_from_revision_id`; the source remains
  byte-for-byte unchanged.
- The post version is a concurrency token. Workflow transitions can create intentional gaps between
  revision version numbers.

## Scheduled worker

Scheduling inserts the publication and `publish` job atomically. The job payload pins post,
publication and revision IDs. `bun run jobs:run` claims at most 50 due jobs; the protected
`POST /api/jobs/run` adapter provides the same operation for an authorized deployment trigger.

Claims use a 30-second conditional lease. Failures retain a stable error code, apply bounded
exponential delay and stop after three attempts. Completion first checks publication status, making
lease recovery and repeated execution no-ops. Archiving a scheduled post cancels only its matching
publication/job.

Deployment must invoke the worker at least once per minute. No external queue or paid scheduler is
required by the application contract.
