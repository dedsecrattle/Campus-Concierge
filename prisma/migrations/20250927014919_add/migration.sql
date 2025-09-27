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
    "is_active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_chats" ("created_at", "escalated_to_human", "follow_up_requested", "id", "status", "student_email", "student_name", "updated_at") SELECT "created_at", "escalated_to_human", "follow_up_requested", "id", "status", "student_email", "student_name", "updated_at" FROM "chats";
DROP TABLE "chats";
ALTER TABLE "new_chats" RENAME TO "chats";
CREATE INDEX "chats_session_email_idx" ON "chats"("session_email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
