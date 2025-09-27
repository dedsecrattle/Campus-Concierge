import { Server as ServerIO, Socket } from "socket.io";
import { Server as NetServer } from "http";

// Socket.IO server events
export interface ServerToClientEvents {
  "new-message": (data: {
    chatId: string;
    message: {
      id: string;
      content: string;
      sender: string;
      timestamp: string;
      messageType: string;
    };
  }) => void;

  "admin-intervention": (data: {
    chatId: string;
    message: {
      id: string;
      content: string;
      sender: "admin";
      timestamp: string;
    };
  }) => void;

  "chat-escalated": (data: { chatId: string }) => void;

  "user-joined": (data: { chatId: string; userCount: number }) => void;

  "user-activity-changed": (data: {
    chatId: string;
    isOnline: boolean;
    userCount: number;
  }) => void;
}

// Socket.IO client events
export interface ClientToServerEvents {
  "join-chat": (chatId: string) => void;
  "leave-chat": (chatId: string) => void;
  "join-admin": () => void;
  "send-message": (data: {
    chatId: string;
    content: string;
    sender: string;
  }) => void;
}

// Socket.IO inter-server events
export interface InterServerEvents {
  ping: () => void;
}

// Socket.IO socket data
export interface SocketData {
  userId?: string;
  chatId?: string;
  isAdmin?: boolean;
}

// Typed Socket.IO server
export type TypedServer = ServerIO<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Create typed server instance
export const createTypedServer = (httpServer: NetServer) =>
  new ServerIO<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

// Typed Socket.IO socket
export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Extended NextRequest for Socket.IO
export interface NextRequestWithSocket {
  socket?: {
    server?: {
      httpServer?: NetServer;
      io?: TypedServer;
    };
  };
}
