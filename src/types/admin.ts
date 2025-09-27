import { Chat } from './index';

export interface ChatWithUserInfo extends Chat {
  userIdentifier: string;
  isReturningUser: boolean;
  userType: 'Registered' | 'Follow-up' | 'Anonymous';
  totalMessageCount?: number;
  messages?: Array<{
    id: string;
    timestamp: Date;
  }>;
  _count?: {
    messages: number;
    adminInterventions: number;
  };
  // Ensure activity tracking fields are available
  userOnline: boolean;
  lastActivity: Date;
  connectionCount: number;
}

export interface AdminDashboardStats {
  totalChats: number;
  activeChats: number;
  escalatedChats: number;
  followUpRequests: number;
  uniqueUsers: number;
}

export interface OnlineUserState {
  chatId: string;
  isOnline: boolean;
  userCount: number;
}

export interface AdminStats {
  totalChats: number;
  activeChats: number;
  escalatedChats: number;
  followUpChats: number;
  uniqueUsers: number;
}
