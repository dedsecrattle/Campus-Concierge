// Re-export Prisma generated types
export type { Chat, Message, AdminIntervention } from "@prisma/client";
import type { Chat, Message, AdminIntervention } from "@prisma/client";

// Extended types for UI components
export interface ChatWithCounts extends Chat {
  messageCount?: number;
  lastMessageTime?: Date;
  totalMessageCount?: number;
  _count?: {
    messages: number;
    adminInterventions: number;
  };
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
}

// Database query result types
export interface ChatWithRelations extends Chat {
  messages: Message[];
  adminInterventions: AdminIntervention[];
  _count: {
    messages: number;
    adminInterventions: number;
  };
}

export interface ChatbotResponse {
  message: string;
  shouldEscalate: boolean;
  requestsFollowUp: boolean;
}
