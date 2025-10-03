import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import enhancedUnifiedMessagingService from '../services/EnhancedUnifiedMessagingService';
import { useAuth } from './AuthContextSupabase';

const UnifiedMessagingContext = createContext();

export const useUnifiedMessaging = () => {
  const context = useContext(UnifiedMessagingContext);
  if (!context) {
    throw new Error('useUnifiedMessaging must be used within a UnifiedMessagingProvider');
  }
  return context;
};

export const UnifiedMessagingProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState(new Map());

  // Initialize the service
  useEffect(() => {
    initializeMessaging();
  }, [initializeMessaging]);

  const initializeMessaging = useCallback(async () => {
    setLoading(true);
    try {
      await enhancedUnifiedMessagingService.initialize();
      await loadConversations();
      await loadUsers();
    } catch (error) {
      console.error('UnifiedMessagingContext: Initialization failed:', error);
    } finally {
      setLoading(false);
    }
  }, [loadConversations]);

  const loadConversations = useCallback(async () => {
    try {
      // Get conversations sorted by newest first for the current user
      const userId = user?.id; // No fallback - user must be logged in
      const sortedConversations = enhancedUnifiedMessagingService.getConversationsByUser(userId);
      setConversations(sortedConversations);
    } catch (error) {
      console.error('UnifiedMessagingContext: Error loading conversations:', error);
    }
  }, [user?.id]);

  const loadUsers = async () => {
    try {
      const allUsers = enhancedUnifiedMessagingService.getAllUsers();
      const usersMap = new Map();
      
      if (Array.isArray(allUsers)) {
        allUsers.forEach(user => {
          if (user && user.id) {
            usersMap.set(user.id, user);
          }
        });
      }
      
      setUsers(usersMap);
    } catch (error) {
      console.error('UnifiedMessagingContext: Error loading users:', error);
      setUsers(new Map());
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const conversationMessages = enhancedUnifiedMessagingService.getMessagesByConversation(conversationId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error('UnifiedMessagingContext: Error loading messages:', error);
    }
  };

  // ==================== CONVERSATION MANAGEMENT ====================

  const createConversation = async (participantIds, jobId = null, participantNames = []) => {
    try {
      const result = await enhancedUnifiedMessagingService.createConversation(participantIds, participantNames, jobId);
      if (result.success) {
        await loadConversations();
        return result;
      }
      return result;
    } catch (error) {
      console.error('UnifiedMessagingContext: Error creating conversation:', error);
      return { success: false, error: error.message };
    }
  };

  const findOrCreateConversation = async (participantIds, jobId = null, participantNames = []) => {
    try {
      const result = await enhancedUnifiedMessagingService.findOrCreateConversation(participantIds, jobId, participantNames);
      if (result.success) {
        await loadConversations();
        return result;
      }
      return result;
    } catch (error) {
      console.error('UnifiedMessagingContext: Error finding/creating conversation:', error);
      return { success: false, error: error.message };
    }
  };

  const selectConversation = async (conversationId) => {
    try {
      const conversation = enhancedUnifiedMessagingService.getConversationById(conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        await loadMessages(conversationId);
        await markConversationAsRead(conversationId);
        return conversation;
      }
      return null;
    } catch (error) {
      console.error('UnifiedMessagingContext: Error selecting conversation:', error);
      return null;
    }
  };

  const markConversationAsRead = async (conversationId) => {
    try {
      await enhancedUnifiedMessagingService.markMessageAsRead(conversationId, 'current_user');
      await loadConversations();
    } catch (error) {
      console.error('UnifiedMessagingContext: Error marking conversation as read:', error);
    }
  };

  // ==================== MESSAGE MANAGEMENT ====================

  const sendMessage = async (conversationId, senderId, content, type = 'text', metadata = {}) => {
    try {
      const result = await enhancedUnifiedMessagingService.sendMessage(conversationId, senderId, content, type, metadata);
      if (result.success) {
        await loadMessages(conversationId);
        await loadConversations();
        return result;
      }
      return result;
    } catch (error) {
      console.error('UnifiedMessagingContext: Error sending message:', error);
      return { success: false, error: error.message };
    }
  };

  // ==================== USER MANAGEMENT ====================

  const addUser = async (userData) => {
    try {
      const user = await enhancedUnifiedMessagingService.addUser(userData);
      await loadUsers();
      return user;
    } catch (error) {
      console.error('UnifiedMessagingContext: Error adding user:', error);
      return null;
    }
  };

  const getUser = (userId) => {
    return enhancedUnifiedMessagingService.getUser(userId);
  };

  // ==================== UTILITY METHODS ====================

  const getOtherParticipant = (conversation, currentUserId) => {
    return enhancedUnifiedMessagingService.getOtherParticipant(conversation, currentUserId);
  };

  const getOtherParticipantName = (conversation, currentUserId) => {
    return enhancedUnifiedMessagingService.getOtherParticipantName(conversation, currentUserId);
  };

  const getDebugInfo = () => {
    return enhancedUnifiedMessagingService.getDebugInfo();
  };

  // ==================== CONTEXT VALUE ====================

  const value = {
    // State
    conversations,
    messages,
    currentConversation,
    loading,
    users,
    
    // Conversation methods
    createConversation,
    findOrCreateConversation,
    selectConversation,
    markConversationAsRead,
    loadConversations,
    
    // Message methods
    sendMessage,
    loadMessages,
    
    // User methods
    addUser,
    getUser,
    
    // Utility methods
    getOtherParticipant,
    getOtherParticipantName,
    getDebugInfo
  };

  return (
    <UnifiedMessagingContext.Provider value={value}>
      {children}
    </UnifiedMessagingContext.Provider>
  );
};
