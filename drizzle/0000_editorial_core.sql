PRAGMA foreign_keys = ON;

CREATE TABLE "user" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "email_verified" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL
);

CREATE TABLE "session" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "expires_at" INTEGER NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);
CREATE INDEX "session_user_idx" ON "session" ("user_id");

CREATE TABLE "account" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "access_token_expires_at" INTEGER,
  "refresh_token_expires_at" INTEGER,
  "scope" TEXT,
  "password" TEXT,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL,
  UNIQUE ("provider_id", "account_id")
);
CREATE INDEX "account_user_idx" ON "account" ("user_id");

CREATE TABLE "verification" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" INTEGER NOT NULL,
  "created_at" INTEGER,
  "updated_at" INTEGER
);
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");

CREATE TABLE "workspaces" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "is_demo" INTEGER NOT NULL DEFAULT 0,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL
);

CREATE TABLE "memberships" (
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL CHECK ("role" IN ('Owner','Admin','Editor','Author','Reviewer')),
  "created_at" INTEGER NOT NULL,
  PRIMARY KEY ("workspace_id", "user_id")
);
CREATE INDEX "membership_user_idx" ON "memberships" ("user_id");

CREATE TABLE "posts" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL DEFAULT '',
  "state" TEXT NOT NULL DEFAULT 'Draft' CHECK ("state" IN ('Draft','InReview','ChangesRequested','Approved','Scheduled','Published','Archived')),
  "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version" > 0),
  "author_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "draft_revision_id" TEXT REFERENCES "revisions"("id") ON DELETE SET NULL,
  "published_revision_id" TEXT REFERENCES "revisions"("id") ON DELETE SET NULL,
  "scheduled_for" INTEGER,
  "submitted_at" INTEGER,
  "approved_at" INTEGER,
  "published_at" INTEGER,
  "archived_at" INTEGER,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL,
  UNIQUE ("workspace_id", "slug"),
  UNIQUE ("workspace_id", "id")
);
CREATE INDEX "post_workspace_state_idx" ON "posts" ("workspace_id", "state");

CREATE TABLE "revisions" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "post_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL DEFAULT '',
  "content" TEXT NOT NULL,
  "author_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "restored_from_revision_id" TEXT,
  "created_at" INTEGER NOT NULL,
  UNIQUE ("post_id", "version"),
  UNIQUE ("workspace_id", "id"),
  FOREIGN KEY ("workspace_id", "post_id") REFERENCES "posts"("workspace_id", "id") ON DELETE CASCADE
);
CREATE INDEX "revision_workspace_post_idx" ON "revisions" ("workspace_id", "post_id");

CREATE TABLE "publications" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "post_id" TEXT NOT NULL,
  "revision_id" TEXT NOT NULL REFERENCES "revisions"("id") ON DELETE RESTRICT,
  "status" TEXT NOT NULL CHECK ("status" IN ('scheduled','published','cancelled')),
  "scheduled_for" INTEGER,
  "published_at" INTEGER,
  "idempotency_key" TEXT NOT NULL UNIQUE,
  "created_by" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "created_at" INTEGER NOT NULL,
  FOREIGN KEY ("workspace_id", "post_id") REFERENCES "posts"("workspace_id", "id") ON DELETE CASCADE
);
CREATE INDEX "publication_due_idx" ON "publications" ("status", "scheduled_for");

CREATE TABLE "media_assets" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "post_id" TEXT,
  "status" TEXT NOT NULL CHECK ("status" IN ('pending','active','replaced','deleted','cleanup_pending')),
  "storage_key" TEXT NOT NULL UNIQUE,
  "file_name" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "byte_size" INTEGER NOT NULL CHECK ("byte_size" > 0),
  "width" INTEGER NOT NULL,
  "height" INTEGER NOT NULL,
  "checksum" TEXT NOT NULL,
  "alt_text" TEXT NOT NULL DEFAULT '',
  "created_by" TEXT NOT NULL REFERENCES "user"("id") ON DELETE RESTRICT,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL,
  FOREIGN KEY ("workspace_id", "post_id") REFERENCES "posts"("workspace_id", "id") ON DELETE SET NULL
);
CREATE INDEX "media_workspace_post_idx" ON "media_assets" ("workspace_id", "post_id");

CREATE TABLE "media_blobs" (
  "asset_id" TEXT PRIMARY KEY NOT NULL REFERENCES "media_assets"("id") ON DELETE CASCADE,
  "data" BLOB NOT NULL
);

CREATE TABLE "audit_events" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "actor_id" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "action" TEXT NOT NULL,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT,
  "request_id" TEXT NOT NULL,
  "metadata" TEXT NOT NULL DEFAULT '{}',
  "created_at" INTEGER NOT NULL
);
CREATE INDEX "audit_workspace_created_idx" ON "audit_events" ("workspace_id", "created_at");

CREATE TABLE "ai_usage" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "mode" TEXT NOT NULL CHECK ("mode" IN ('mock','gemini')),
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "latency_ms" INTEGER NOT NULL,
  "input_characters" INTEGER NOT NULL,
  "output_characters" INTEGER NOT NULL,
  "input_tokens" INTEGER,
  "output_tokens" INTEGER,
  "created_at" INTEGER NOT NULL
);
CREATE INDEX "ai_usage_workspace_created_idx" ON "ai_usage" ("workspace_id", "created_at");

CREATE TABLE "jobs" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL CHECK ("type" IN ('publish','media_cleanup')),
  "payload" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','leased','completed','failed')),
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "run_at" INTEGER NOT NULL,
  "lease_until" INTEGER,
  "last_error_code" TEXT,
  "idempotency_key" TEXT NOT NULL UNIQUE,
  "created_at" INTEGER NOT NULL,
  "updated_at" INTEGER NOT NULL
);
CREATE INDEX "job_claim_idx" ON "jobs" ("status", "run_at", "lease_until");

CREATE TABLE "rate_limits" (
  "key" TEXT NOT NULL,
  "window_started_at" INTEGER NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expires_at" INTEGER NOT NULL,
  PRIMARY KEY ("key", "window_started_at")
);
CREATE INDEX "rate_limit_expiry_idx" ON "rate_limits" ("expires_at");

CREATE TRIGGER "revision_immutable_update"
BEFORE UPDATE ON "revisions"
BEGIN
  SELECT RAISE(ABORT, 'IMMUTABLE_REVISION');
END;

CREATE TRIGGER "audit_event_immutable_update"
BEFORE UPDATE ON "audit_events"
BEGIN
  SELECT RAISE(ABORT, 'IMMUTABLE_AUDIT_EVENT');
END;
