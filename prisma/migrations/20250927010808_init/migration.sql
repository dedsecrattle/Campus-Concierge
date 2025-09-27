-- CreateTable
CREATE TABLE "chats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "escalated_to_human" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_requested" BOOLEAN NOT NULL DEFAULT false,
    "student_name" TEXT,
    "student_email" TEXT
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chat_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    CONSTRAINT "messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "admin_interventions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chat_id" TEXT NOT NULL,
    "admin_message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_interventions_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
