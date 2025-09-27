'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, MessageCircle, User, Clock, AlertTriangle, Calendar, Send } from 'lucide-react';
import { Chat, Message, ChatWithMessages } from '@/types';
import { ChatWithUserInfo } from '@/types/admin';
import { getMessagesByChat } from '@/lib/database-prisma';
import Link from 'next/link';

interface ChatDetailModalProps {
  chat: ChatWithUserInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (chatId: string, message: string) => void;
}

const ChatDetailModal = ({ chat, isOpen, onClose, onSendMessage }: ChatDetailModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!chat) return;
    
    try {
      const response = await fetch(`/api/chat?chatId=${chat.id}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [chat]);

  useEffect(() => {
    if (chat && isOpen) {
      fetchMessages();
    }
  }, [chat, isOpen, fetchMessages]);

  const handleSendMessage = async () => {
    if (!chat || !newMessage.trim() || loading) return;

    setLoading(true);
    try {
      await onSendMessage(chat.id, newMessage);
      setNewMessage('');
      await fetchMessages(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !chat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Chat Details</h2>
            <p className="text-sm text-gray-600">Chat ID: {chat.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Chat Info */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                chat.status === 'active' ? 'bg-green-100 text-green-800' :
                chat.status === 'escalated' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {chat.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2">{new Date(chat.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Messages:</span>
              <span className="ml-2">{(chat as any)._count?.messages || 0}</span>
            </div>
            <div>
              <span className="font-medium">Escalated:</span>
              <span className="ml-2">{chat.escalatedToHuman ? 'Yes' : 'No'}</span>
            </div>
          </div>
          {chat.studentName && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Student:</span>
              <span className="ml-2">{chat.studentName}</span>
              {chat.studentEmail && (
                <span className="ml-2 text-gray-600">({chat.studentEmail})</span>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.sender === 'admin'
                      ? 'bg-purple-600 text-white'
                      : message.messageType === 'system'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {message.sender === 'admin' ? 'Admin' : 
                     message.sender === 'user' ? 'Student' : 'Bot'} • 
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Message Input */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message as admin..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
    </div>
  );

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/admin/chats');
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAdminMessage = async (chatId: string, message: string) => {
    try {
      await fetch('/api/admin/intervention', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId, message }),
      });
      
      // Refresh chats to update message counts
      await fetchChats();
    } catch (error) {
      console.error('Error sending admin message:', error);
      throw error;
    }
  };

  const openChatDetail = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Chat
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Monitor and manage chat conversations</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Chats</p>
              <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Chats</p>
              <p className="text-2xl font-bold text-gray-900">
                {chats.filter(chat => chat.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Escalated</p>
              <p className="text-2xl font-bold text-gray-900">
                {chats.filter(chat => chat.escalatedToHuman).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Follow-ups</p>
              <p className="text-2xl font-bold text-gray-900">
                {chats.filter(chat => chat.followUpRequested).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <User className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(chats.map(chat => (chat as any).userIdentifier || 'Anonymous')).size}
              </p>
            </div>
          </div>
        </div>
      </div>

        {/* Chats Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
          </div>
          
          {chats.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chat ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User / Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Messages
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chats.map((chat) => (
                    <tr key={chat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {chat.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {(chat as any).userIdentifier || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {(chat as any).userType} User
                            {(chat as any).isReturningUser && (
                              <span className="ml-1 inline-flex px-1 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                                Returning
                              </span>
                            )}
                          </div>
                          {chat.studentName && chat.studentName !== (chat as any).userIdentifier && (
                            <div className="text-xs text-gray-400">
                              Name: {chat.studentName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.status)}`}>
                          {chat.status}
                        </span>
                        {chat.escalatedToHuman && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Escalated
                          </span>
                        )}
                        {chat.followUpRequested && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            Follow-up
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(chat as any)._count?.messages || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(chat as any).messages?.[0]?.timestamp ? (
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1 text-gray-400" />
                            {new Date((chat as any).messages[0].timestamp).toLocaleTimeString()}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openChatDetail(chat)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Chat Detail Modal */}
      <ChatDetailModal
        chat={selectedChat}
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        onSendMessage={handleSendAdminMessage}
      />
    </div>
  );
}
