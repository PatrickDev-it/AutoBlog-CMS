CREATE TABLE "idempotency_records" (
  "workspace_id" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "created_at" INTEGER NOT NULL,
  PRIMARY KEY ("workspace_id", "operation", "key")
);

CREATE TRIGGER "idempotency_record_immutable_update"
BEFORE UPDATE ON "idempotency_records"
BEGIN
  SELECT RAISE(ABORT, 'IMMUTABLE_IDEMPOTENCY_RECORD');
END;
