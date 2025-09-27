"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Calendar, Mail, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { FollowUpWithChat } from "@/types";

interface FollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId?: string;
}

export default function FollowUpModal({ isOpen, onClose, chatId }: FollowUpModalProps) {
  const [followUps, setFollowUps] = useState<FollowUpWithChat[]>([]);
  const [allFollowUps, setAllFollowUps] = useState<FollowUpWithChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'all'>('chat');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadChatFollowUps = useCallback(async () => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/follow-ups?chatId=${chatId}`);
      const data = await response.json();
      setFollowUps(data.followUps || []);
    } catch (error) {
      console.error('Error loading chat follow-ups:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const loadAllFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/follow-ups');
      const data = await response.json();
      setAllFollowUps(data.followUps || []);
    } catch (error) {
      console.error('Error loading all follow-ups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'chat' && chatId) {
        loadChatFollowUps();
      } else if (activeTab === 'all') {
        loadAllFollowUps();
      }
    }
  }, [isOpen, activeTab, chatId, loadChatFollowUps, loadAllFollowUps]);

  const updateFollowUpStatus = async (followUpId: string, status: string, notes?: string) => {
    setUpdatingId(followUpId);
    try {
      await fetch('/api/admin/follow-ups', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ followUpId, status, notes }),
      });
      
      // Reload the appropriate data
      if (activeTab === 'chat') {
        await loadChatFollowUps();
      } else {
        await loadAllFollowUps();
      }
    } catch (error) {
      console.error('Error updating follow-up:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'contacted':
        return <Mail size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const currentFollowUps = activeTab === 'chat' ? followUps : allFollowUps;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-full flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Follow-up Requests
            </h2>
            <p className="text-sm text-gray-600">
              {chatId ? 'Manage follow-up requests for this chat and all chats' : 'Manage all follow-up requests'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
            {chatId && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                This Chat ({followUps.length})
              </button>
            )}
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Follow-ups ({allFollowUps.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading follow-ups...</span>
            </div>
          ) : currentFollowUps.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No follow-up requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentFollowUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <User size={16} className="text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {followUp.studentName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-gray-500" />
                          <span className="text-gray-600">
                            {followUp.studentEmail}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>
                            Requested: {new Date(followUp.requestedAt).toLocaleDateString()} at{' '}
                            {new Date(followUp.requestedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {activeTab === 'all' && (
                          <div>
                            <span className="font-medium">Chat ID:</span> {followUp.chatId.substring(0, 8)}...
                          </div>
                        )}
                      </div>

                      {followUp.contactedAt && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Contacted:</span>{' '}
                          {new Date(followUp.contactedAt).toLocaleDateString()} at{' '}
                          {new Date(followUp.contactedAt).toLocaleTimeString()}
                        </div>
                      )}

                      {followUp.completedAt && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Completed:</span>{' '}
                          {new Date(followUp.completedAt).toLocaleDateString()} at{' '}
                          {new Date(followUp.completedAt).toLocaleTimeString()}
                        </div>
                      )}

                      {followUp.notes && (
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">Notes:</span> {followUp.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          followUp.status
                        )}`}
                      >
                        {getStatusIcon(followUp.status)}
                        <span className="ml-1 capitalize">{followUp.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                    {followUp.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateFollowUpStatus(followUp.id, 'contacted')}
                          disabled={updatingId === followUp.id}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Mark as Contacted
                        </button>
                        <button
                          onClick={() => updateFollowUpStatus(followUp.id, 'cancelled')}
                          disabled={updatingId === followUp.id}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {followUp.status === 'contacted' && (
                      <button
                        onClick={() => updateFollowUpStatus(followUp.id, 'completed')}
                        disabled={updatingId === followUp.id}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
