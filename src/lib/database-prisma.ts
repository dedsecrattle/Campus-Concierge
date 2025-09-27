import { PrismaClient } from "@prisma/client";
import type { Chat } from "@prisma/client";

const prisma = new PrismaClient();

// Chat operations
export const createChat = async (
  chatId: string,
  sessionEmail?: string,
  studentName?: string,
  studentEmail?: string
): Promise<Chat> => {
  const prismaChat = await prisma.chat.create({
    data: {
      id: chatId,
      sessionEmail,
      studentName,
      studentEmail,
    },
  });

  // Return Prisma Chat directly
  return prismaChat;
};

// Find active chat by session email
export const findActiveChatByEmail = async (
  sessionEmail: string
): Promise<Chat | null> => {
  const prismaChat = await prisma.chat.findFirst({
    where: {
      sessionEmail,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return prismaChat;
};

// Get all chats for a session email
export const getChatsBySessionEmail = async (
  sessionEmail: string
): Promise<(Chat & { _count: { messages: number } })[]> => {
  const prismaChats = await prisma.chat.findMany({
    where: {
      sessionEmail,
    },
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return prismaChats;
};

export const getChatById = async (chatId: string): Promise<Chat | null> => {
  const prismaChat = await prisma.chat.findUnique({
    where: { id: chatId },
  });
  return prismaChat;
};

export const getAllChats = async () => {
  const chats = await prisma.chat.findMany({
    include: {
      messages: {
        select: {
          id: true,
          timestamp: true,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 1,
      },
      _count: {
        select: {
          messages: true,
          adminInterventions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Add total message count (messages + admin interventions)
  return chats.map((chat) => ({
    ...chat,
    totalMessageCount: chat._count.messages + chat._count.adminInterventions,
  }));
};

export const updateChatStatus = async (
  chatId: string,
  status: string
): Promise<Chat> => {
  return await prisma.chat.update({
    where: { id: chatId },
    data: { status },
  });
};

export const escalateToHuman = async (chatId: string): Promise<Chat> => {
  return await prisma.chat.update({
    where: { id: chatId },
    data: {
      escalatedToHuman: true,
      status: "escalated",
    },
  });
};

export const requestFollowUp = async (chatId: string): Promise<Chat> => {
  return await prisma.chat.update({
    where: { id: chatId },
    data: { followUpRequested: true },
  });
};

export const markPreviousChatsInactive = async (
  sessionEmail: string,
  currentChatId: string
): Promise<void> => {
  await prisma.chat.updateMany({
    where: {
      sessionEmail: sessionEmail,
      id: { not: currentChatId },
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
};

export const addMessage = async (
  chatId: string,
  content: string,
  sender: "user" | "bot" | "admin",
  messageType: "text" | "system" | "escalation" | "follow_up" = "text"
) => {
  return await prisma.message.create({
    data: {
      chatId,
      content,
      sender,
      messageType,
    },
  });
};

export const getMessagesByChat = async (chatId: string) => {
  // Get regular messages
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { timestamp: "asc" },
  });

  // Get admin interventions and convert them to message format
  const interventions = await prisma.adminIntervention.findMany({
    where: { chatId },
    orderBy: { timestamp: "asc" },
  });

  // Convert admin interventions to message format
  const interventionMessages = interventions.map((intervention) => ({
    id: intervention.id,
    chatId: intervention.chatId,
    content: intervention.adminMessage,
    sender: "admin" as const,
    timestamp: intervention.timestamp,
    messageType: "text" as const,
  }));

  // Combine and sort all messages by timestamp
  const allMessages = [...messages, ...interventionMessages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return allMessages;
};

export const addAdminIntervention = async (
  chatId: string,
  adminMessage: string
) => {
  return await prisma.adminIntervention.create({
    data: {
      chatId,
      adminMessage,
    },
  });
};

export const setUserOnline = async (chatId: string): Promise<Chat> => {
  return await prisma.chat.update({
    where: { id: chatId },
    data: {
      userOnline: true,
      lastActivity: new Date(),
      connectionCount: { increment: 1 },
    },
  });
};

export const getOnlineUsers = async () => {
  return await prisma.chat.findMany({
    where: {
      userOnline: true,
    },
    select: {
      id: true,
      userOnline: true,
      lastActivity: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const setUserOffline = async (chatId: string): Promise<Chat> => {
  // Get current connection count
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: {
      connectionCount: true,
    },
  });

  const newConnectionCount = Math.max(0, (chat?.connectionCount || 1) - 1);

  return await prisma.chat.update({
    where: { id: chatId },
    data: {
      userOnline: newConnectionCount > 0,
      lastActivity: new Date(),
      connectionCount: newConnectionCount,
    },
  });
};

export const updateLastActivity = async (chatId: string): Promise<Chat> => {
  return await prisma.chat.update({
    where: { id: chatId },
    data: {
      lastActivity: new Date(),
    },
  });
};

// Get online users count
export const getOnlineUsersCount = async (): Promise<number> => {
  return await prisma.chat.count({
    where: {
      userOnline: true,
    },
  });
};

// Utility function to disconnect Prisma (useful for serverless)
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
