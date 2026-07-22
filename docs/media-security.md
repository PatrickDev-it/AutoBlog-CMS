# Media security policy

## Accepted input

- Authenticated bounded multipart only; remote URL ingestion is not implemented and the remote-host
  allowlist is empty, eliminating this SSRF path.
- PNG, JPEG and WebP only. The claimed MIME must match the decoded `sharp` format.
- Default maximum: 5 MiB; configuration cannot exceed 10 MiB.
- Maximum width/height: 4096 pixels; maximum decoded area: 16 megapixels.
- Filenames are display metadata only. Path components and unsafe characters are removed; provider
  keys are generated from authenticated workspace identity plus a UUID.

The route reads the request stream with an explicit cap before invoking multipart parsing. It returns
stable validation errors without decoder/provider details. Authenticated reads send `nosniff` and
private cache headers.

## Storage and replacement

`MediaProvider` is the object boundary. The default production adapter stores opaque bounded objects
in durable libSQL; metadata remains in `media_assets`. This keeps local, CI and remote libSQL behavior
identical without private infrastructure.

Upload order is verify → provider put → metadata finalization. Replacement marks the old object
`replaced` and activates the new object in one transaction protected by a partial unique index. If
provider put or finalization fails, the prior active row is unchanged. Orphan and replaced objects are
deleted by leased, idempotent `media_cleanup` jobs with three attempts.

Authors may upload/replace only for their own posts. Owner/Admin/Editor may delete. Every operation is
workspace-filtered and audited; hiding a control is not relied upon for enforcement.

## Operational limitation

Database object storage is deliberate for a bounded portfolio demo. A high-volume deployment should
supersede RFC 003 with signed direct uploads to an explicitly approved object store/CDN.
