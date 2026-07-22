CREATE TABLE "media_objects" (
  "storage_key" TEXT PRIMARY KEY NOT NULL,
  "data" BLOB NOT NULL,
  "created_at" INTEGER NOT NULL
);

DROP TABLE "media_blobs";

ALTER TABLE "media_assets" ADD COLUMN "replaces_asset_id" TEXT;

CREATE UNIQUE INDEX "media_one_active_per_post"
ON "media_assets" ("workspace_id", "post_id")
WHERE "status" = 'active' AND "post_id" IS NOT NULL;

CREATE TABLE "ai_quota_windows" (
  "workspace_id" TEXT NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "window_started_at" INTEGER NOT NULL,
  "reserved_characters" INTEGER NOT NULL DEFAULT 0 CHECK ("reserved_characters" >= 0),
  "used_characters" INTEGER NOT NULL DEFAULT 0 CHECK ("used_characters" >= 0),
  "updated_at" INTEGER NOT NULL,
  PRIMARY KEY ("workspace_id", "window_started_at")
);
