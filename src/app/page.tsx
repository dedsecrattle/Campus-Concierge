"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, AlertCircle, Calendar, Settings } from "lucide-react";
import { Message, Chat } from "@/types";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket";

interface ChatMessage extends Omit<Message, "id" | "chatId" | "timestamp"> {
  id?: string;
  timestamp?: string;
}

interface EscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEscalate: () => void;
}

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string) => void;
}

interface ChatWithCount extends Chat {
  _count?: {
    messages: number;
  };
}

interface EmailModalProps {
  isOpen: boolean;
  onSubmit: (email: string, chatId?: string) => void;
  isReturningUser?: boolean;
  existingChats?: ChatWithCount[];
}

const EscalationModal = ({
  isOpen,
  onClose,
  onEscalate,
}: EscalationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertCircle className="text-orange-500 mr-2" size={24} />
          <h3 className="text-lg font-semibold">Connect with Human Advisor</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Would you like to escalate this conversation to a human admissions
          counselor? They&apos;ll be able to provide more detailed and
          personalized assistance.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onEscalate}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Yes, Connect Me
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue with Bot
          </button>
        </div>
      </div>
    </div>
  );
};

const FollowUpModal = ({ isOpen, onClose, onSubmit }: FollowUpModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onSubmit(name.trim(), email.trim());
      setName("");
      setEmail("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <Calendar className="text-green-500 mr-2" size={24} />
          <h3 className="text-lg font-semibold">Schedule Follow-up Call</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Please provide your contact information so an admissions counselor can
          schedule a call with you.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Schedule Call
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmailModal = ({ isOpen, onSubmit, isReturningUser, existingChats }: EmailModalProps) => {
  const [email, setEmail] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubmit(email.trim());
      setEmail("");
    }
  };

  const handleContinueChat = () => {
    if (selectedChatId) {
      // Continue with existing chat
      onSubmit(email, selectedChatId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <User className="text-blue-500 mr-2" size={24} />
          <h3 className="text-lg font-semibold">
            {isReturningUser ? "Welcome Back!" : "Get Started"}
          </h3>
        </div>
        
        {isReturningUser && existingChats && existingChats.length > 0 ? (
          <div>
            <p className="text-gray-600 mb-4">
              We found existing conversations for {email}. Would you like to continue a previous chat or start a new one?
            </p>
            
            <div className="mb-4 max-h-32 overflow-y-auto">
              {existingChats.map((chat: ChatWithCount) => (
                <div
                  key={chat.id}
                  className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                    selectedChatId === chat.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  <div className="text-sm font-medium">
                    Chat from {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Status: {chat.status} • Messages: {chat._count?.messages || 0}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleContinueChat}
                disabled={!selectedChatId}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Continue Selected Chat
              </button>
              <button
                onClick={() => onSubmit(email)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Please provide your email address to start chatting. This helps us save your conversation and you can return to it later.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Chatting
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Removed: polling-related state variables (lastMessageCount, isRefreshing) - now using Socket.IO
  const [sessionEmail, setSessionEmail] = useState<string>("");
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [existingChats, setExistingChats] = useState<ChatWithCount[]>([]);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message (only for new chats)
  useEffect(() => {
    if (!chatId && showEmailModal === false) {
      setMessages([
        {
          content: `Hello! I'm the ${
            process.env.NEXT_PUBLIC_SCHOOL_NAME || "Stanford University"
          } admissions chatbot. I'm here to help you learn more about our university, programs, and application process. How can I assist you today?`,
          sender: "bot",
          messageType: "text",
        },
      ]);
    }
  }, [chatId, showEmailModal]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io({
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
    });

    // Listen for new messages
    newSocket.on('new-message', (data) => {
      console.log('Received new message:', data);
      if (data.chatId === chatId) {
        const newMessage: ChatMessage = {
          content: data.message.content,
          sender: data.message.sender,
          messageType: data.message.messageType,
          id: data.message.id,
          timestamp: data.message.timestamp,
        };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    // Listen for admin interventions
    newSocket.on('admin-intervention', (data) => {
      console.log('Received admin intervention:', data);
      if (data.chatId === chatId) {
        const adminMessage: ChatMessage = {
          content: data.message.content,
          sender: 'admin',
          messageType: 'text',
          id: data.message.id,
          timestamp: data.message.timestamp,
        };
        setMessages(prev => [...prev, adminMessage]);
      }
    });

    setSocket(newSocket);

    return () => {
      // Properly leave the chat room before disconnecting
      if (chatId) {
        newSocket.emit('leave-chat', chatId);
      }
      newSocket.close();
    };
  }, [chatId]);

  // Join chat room when chatId changes
  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join-chat', chatId);
      console.log(`Joined chat room: ${chatId}`);
    }
  }, [socket, chatId]);

  // Session management functions
  const handleEmailSubmit = async (email: string, existingChatId?: string) => {
    setSessionEmail(email);
    
    if (existingChatId) {
      // Continue existing chat
      setChatId(existingChatId);
      await loadExistingMessages(existingChatId);
      setShowEmailModal(false);
      return;
    }
    
    try {
      // Check for existing sessions
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.hasExistingChats && data.existingChats.length > 0) {
        setExistingChats(data.existingChats);
        setIsReturningUser(true);
        // Keep modal open to show chat options
        return;
      }
      
      // No existing chats, proceed with new chat
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error checking session:', error);
      // Proceed anyway
      setShowEmailModal(false);
    }
  };

  const loadExistingMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat?chatId=${chatId}`);
      const data = await response.json();
      
      if (response.ok && data.messages) {
        const chatMessages = data.messages.map((msg: Message) => ({
          content: msg.content,
          sender: msg.sender,
          messageType: msg.messageType,
          id: msg.id,
          timestamp: msg.timestamp,
        }));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Error loading existing messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      content: inputMessage,
      sender: "user",
      messageType: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: inputMessage,
          isNewChat: !chatId,
          sessionEmail: sessionEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChatId(data.chatId);

        const botMessage: ChatMessage = {
          content: data.message,
          sender: "bot",
          messageType: "text",
        };

        setMessages((prev: ChatMessage[]) => [...prev, botMessage]);
        // Real-time updates via Socket.IO - no need to track message count

        // Check if should show modals
        if (data.shouldEscalate) {
          setShowEscalationModal(true);
        } else if (data.requestsFollowUp) {
          setShowFollowUpModal(true);
        }

        // Real-time messages will be received via Socket.IO
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        content: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        messageType: "text",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!chatId) return;

    try {
      await fetch("/api/chat/escalate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });

      const systemMessage: ChatMessage = {
        content:
          "This conversation has been escalated to a human advisor. An admissions counselor will join the chat shortly.",
        sender: "bot",
        messageType: "system",
      };

      setMessages((prev) => [...prev, systemMessage]);
      setShowEscalationModal(false);
    } catch (error) {
      console.error("Error escalating chat:", error);
    }
  };

  const handleFollowUp = async (name: string, email: string) => {
    if (!chatId) return;

    try {
      await fetch("/api/chat/follow-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          studentName: name,
          studentEmail: email,
        }),
      });

      const systemMessage: ChatMessage = {
        content: `Thank you, ${name}! We've received your request for a follow-up call. An admissions counselor will contact you at ${email} within 1-2 business days.`,
        sender: "bot",
        messageType: "system",
      };

      setMessages((prev) => [...prev, systemMessage]);
      setShowFollowUpModal(false);
    } catch (error) {
      console.error("Error requesting follow-up:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {process.env.NEXT_PUBLIC_SCHOOL_NAME || "Stanford University"}{" "}
              Admissions Chat
            </h1>
            <p className="text-sm text-gray-600">
              Get instant answers to your questions
              <span className={`ml-2 ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                • {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </p>
          </div>
          <Link
            href="/admin"
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={16} className="mr-2" />
            Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender !== "user" && (
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === "admin"
                        ? "bg-purple-600"
                        : "bg-blue-600"
                    }`}
                  >
                    <Bot size={16} className="text-white" />
                  </div>
                </div>
              )}

              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : message.sender === "admin"
                    ? "bg-purple-600 text-white"
                    : message.messageType === "system"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.sender === "admin" && (
                  <p className="text-xs mt-1 opacity-75">👨‍💼 Admin Response</p>
                )}
              </div>

              {message.sender === "user" && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
              </div>
              <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EscalationModal
        isOpen={showEscalationModal}
        onClose={() => setShowEscalationModal(false)}
        onEscalate={handleEscalate}
      />

      <FollowUpModal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        onSubmit={handleFollowUp}
      />

      <EmailModal
        isOpen={showEmailModal}
        onSubmit={handleEmailSubmit}
        isReturningUser={isReturningUser}
        existingChats={existingChats}
      />
    </div>
  );
};
