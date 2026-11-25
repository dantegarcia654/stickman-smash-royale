CREATE TABLE rooms (code TEXT PRIMARY KEY NOT NULL, rev INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL, expires_at INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX rooms_expiry_idx ON rooms (expires_at);
