/*
  Warnings:

  - You are about to drop the column `connection_count` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `escalated_to_human` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `follow_up_requested` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `last_activity` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `session_email` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `student_email` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `student_name` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `user_online` on the `chats` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_chats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "escalatedToHuman" BOOLEAN NOT NULL DEFAULT false,
    "followUpRequested" BOOLEAN NOT NULL DEFAULT false,
    "studentName" TEXT,
    "studentEmail" TEXT,
    "sessionEmail" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "connectionCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_chats" ("id", "status") SELECT "id", "status" FROM "chats";
DROP TABLE "chats";
ALTER TABLE "new_chats" RENAME TO "chats";
CREATE INDEX "chats_sessionEmail_idx" ON "chats"("sessionEmail");
CREATE INDEX "chats_userOnline_idx" ON "chats"("userOnline");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
