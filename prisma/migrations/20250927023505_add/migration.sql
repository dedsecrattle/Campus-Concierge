-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "escalated_to_human" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_requested" BOOLEAN NOT NULL DEFAULT false,
    "student_name" TEXT,
    "student_email" TEXT,
    "session_email" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_online" BOOLEAN NOT NULL DEFAULT false,
    "last_activity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connection_count" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_chats" ("created_at", "escalated_to_human", "follow_up_requested", "id", "is_active", "session_email", "status", "student_email", "student_name", "updated_at") SELECT "created_at", "escalated_to_human", "follow_up_requested", "id", "is_active", "session_email", "status", "student_email", "student_name", "updated_at" FROM "chats";
DROP TABLE "chats";
ALTER TABLE "new_chats" RENAME TO "chats";
CREATE INDEX "chats_session_email_idx" ON "chats"("session_email");
CREATE INDEX "chats_user_online_idx" ON "chats"("user_online");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
