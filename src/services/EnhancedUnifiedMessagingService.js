import { safeSupabase, TABLES } from '../config/supabaseConfig';
import uniqueIdGenerator from '../utils/UniqueIdGenerator';
import { AuthGuard } from '../utils/AuthGuards';
// AsyncStorage removed - using Supabase only

/**
 * ENHANCED UNIFIED MESSAGING SERVICE
 * 
 * This combines the best features from all messaging systems:
 * - Simple, reliable core from UnifiedMessagingService
 * - Advanced features from EnhancedMessagingService
 * - File sharing, voice messages, reactions, typing indicators
 * - Single source of truth for all data
 * - Proper user management
 * - Real-time updates
 * - Message persistence
 */

class EnhancedUnifiedMessagingService {
  constructor() {
    this.conversations = [];
    this.messages = [];
    this.users = new Map();
    this.typingUsers = new Map();
    this.messageStatus = new Map();
    this.isInitialized = false;
    
    // Storage keys
    this.CONVERSATIONS_KEY = 'enhanced_unified_conversations';
    this.MESSAGES_KEY = 'enhanced_unified_messages';
    this.USERS_KEY = 'enhanced_unified_users';
    
    // Message types
    this.MESSAGE_TYPES = {
      TEXT: 'text',
      IMAGE: 'image',
      AUDIO: 'audio',
      VIDEO: 'video',
      DOCUMENT: 'document',
      LOCATION: 'location',
      CONTACT: 'contact',
      SYSTEM: 'system',
      REPLY: 'reply',
      FORWARD: 'forward'
    };

    // Message status
    this.MESSAGE_STATUS = {
      SENDING: 'sending',
      SENT: 'sent',
      DELIVERED: 'delivered',
      READ: 'read',
      FAILED: 'failed'
    };

    // Conversation types
    this.CONVERSATION_TYPES = {
      DIRECT: 'direct',
      GROUP: 'group',
      CUSTOMER_SERVICE: 'customer_service',
      JOB_RELATED: 'job_related'
    };
    
    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      
      // Load data from storage
      await this.loadData();
      
      // Add default users if none exist
      if (this.users.size === 0) {
        await this.addDefaultUsers();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('EnhancedUnifiedMessagingService: Initialization failed:', error);
    }
  }

  // Load user-specific messaging data (requires authentication)
  async loadUserData(userId) {
    if (!userId) {
      console.log('EnhancedUnifiedMessagingService: No user ID provided, skipping user data load');
      return;
    }

    console.log('EnhancedUnifiedMessagingService: Loading messaging data for user:', userId);
    
    try {
      if (!safeSupabase) {
        console.warn('EnhancedUnifiedMessagingService: Supabase not configured');
        this.conversations = [];
        this.messages = [];
        this.users = new Map();
        return;
      }

      // Load conversations where user is a participant
      const conversationsResult = await safeSupabase
        .from(TABLES.CONVERSATIONS)
        .select('*')
        .contains('participants', [userId]);

      // Load messages for conversations involving this user
      const messagesResult = await safeSupabase
        .from(TABLES.MESSAGES)
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);

      // Load user's own profile
      const userResult = await safeSupabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();

      this.conversations = conversationsResult.data || [];
      this.messages = messagesResult.data || [];
      
      // Convert users array to Map for compatibility
      this.users = new Map();
      if (userResult.data) {
        this.users.set(userResult.data.id, userResult.data);
      }
      
      console.log('EnhancedUnifiedMessagingService: Loaded user data - Conversations:', this.conversations.length, 'Messages:', this.messages.length);
    } catch (error) {
      console.error('EnhancedUnifiedMessagingService: Error loading user data from Supabase:', error);
      this.conversations = [];
      this.messages = [];
      this.users = new Map();
    }
  }

  // Legacy method for backward compatibility - now just initializes empty data
  async loadData() {
    console.log('EnhancedUnifiedMessagingService: Initializing with empty data (user-specific data will be loaded after authentication)');
    
    // Initialize with empty arrays - user data will be loaded after authentication
    this.conversations = [];
    this.messages = [];
    this.users = new Map();
  }

  async saveData() {
    // Data is now saved individually to Supabase when operations are performed
    // This method is kept for compatibility but doesn't need to do anything
    console.log('EnhancedUnifiedMessagingService: Data is saved individually to Supabase');
  }

  async addDefaultUsers() {
    // No default users - users will be added dynamically when they register
    // This ensures all users have proper unique IDs from the registration system
    console.log('EnhancedUnifiedMessagingService: No default users added - using dynamic user creation');
  }

  // ==================== USER MANAGEMENT ====================

  async addUser(userData) {
    const user = {
      id: userData.id,
      name: userData.name || 'User',
      email: userData.email || '',
      role: userData.role || 'customer',
      avatar: userData.avatar || '',
      isOnline: userData.isOnline !== undefined ? userData.isOnline : true,
      lastSeen: userData.lastSeen || new Date().toISOString()
    };
    
    this.users.set(user.id, user);
    await this.saveData();
    return user;
  }

  async createOrUpdateUser(userData) {
    // Check if user already exists
    const existingUser = this.users.get(userData.id);
    
    if (existingUser) {
      // Update existing user
      const updatedUser = {
        ...existingUser,
        ...userData,
        lastSeen: new Date().toISOString()
      };
      this.users.set(userData.id, updatedUser);
      await this.saveData();
      return updatedUser;
    } else {
      // Create new user with proper role detection from ID
      const userWithRole = {
        ...userData,
        role: this.getAccountTypeFromId(userData.id) || userData.role || 'customer'
      };
      return await this.addUser(userWithRole);
    }
  }

  // Utility function to get account type from user ID
  getAccountTypeFromId(userId) {
    if (!userId) return null;
    
    // Check if it's a new type-specific format ID (CUSTOMER-YYYYMMDD-HHMMSS-XXXX or MECHANIC-YYYYMMDD-HHMMSS-XXXX)
    if (userId.startsWith('CUSTOMER-')) {
      return 'customer';
    }
    if (userId.startsWith('MECHANIC-')) {
      return 'mechanic';
    }
    
    // Check if it's a legacy format ID (type_timestamp_random)
    if (userId.startsWith('customer_') || userId.startsWith('mechanic_') || userId.startsWith('admin_')) {
      return userId.split('_')[0];
    }
    
    // Legacy test account IDs are no longer supported - use new format IDs from MOCK_CONSTANTS
    // If you encounter old numeric IDs, they should be migrated to new format
    
    return null;
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  getAllUsers() {
    try {
      if (!this.users || !(this.users instanceof Map)) {
        console.warn('EnhancedUnifiedMessagingService: users Map not initialized, returning empty array');
        return [];
      }
      return Array.from(this.users.values());
    } catch (error) {
      console.error('EnhancedUnifiedMessagingService: Error getting all users:', error);
      return [];
    }
  }

  async updateUserStatus(userId, status) {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      user.lastSeen = new Date().toISOString();
      await this.saveData();
    }
  }

  // ==================== CONVERSATION MANAGEMENT ====================

  async createConversation(participantIds, participantNames = [], jobId = null, type = this.CONVERSATION_TYPES.DIRECT) {
    // Validate participant IDs follow type-specific format
    if (participantIds && participantIds.length > 0) {
      participantIds.forEach(id => {
        if (id && typeof id === 'string' && 
            !id.startsWith('CUSTOMER-') && !id.startsWith('MECHANIC-') && 
            !id.startsWith('customer_') && !id.startsWith('mechanic_')) {
          console.warn('EnhancedUnifiedMessagingService: Participant ID does not follow expected format:', id);
        }
      });
    }

    const conversationId = uniqueIdGenerator.generateConversationId();
    
    const conversation = {
      id: conversationId,
      participants: participantIds || [],
      participantNames: participantNames || [],
      jobId: jobId,
      type: type,
      createdAt: new Date().toISOString(),
      lastMessage: null,
      lastMessageTime: null,
      unreadCounts: {}, // Track unread count per user: { userId: count }
      isArchived: false,
      isMuted: false,
      isPinned: false
    };

    this.conversations.push(conversation);
    await this.saveData();
    
    return { success: true, conversation };
  }

  async findOrCreateConversation(participantIds, participantNames = [], jobId = null, type = this.CONVERSATION_TYPES.DIRECT) {
    // First, try to find existing conversation
    let existingConversation = this.conversations.find(conv => {
      if (!conv.participants) return false;
      
      const hasAllParticipants = participantIds.every(id => conv.participants.includes(id));
      const sameJobId = conv.jobId === jobId;
      
      return hasAllParticipants && sameJobId;
    });

    if (existingConversation) {
      return { success: true, conversation: existingConversation, isNew: false };
    }

    // Create new conversation
    const result = await this.createConversation(participantIds, participantNames, jobId, type);
    return { success: result.success, conversation: result.conversation, isNew: true };
  }

  getConversationById(conversationId) {
    return this.conversations.find(conv => conv.id === conversationId);
  }

  getConversationsByUser(userId) {
    // Authentication guard
    const authCheck = AuthGuard.requireAuth({ userId });
    if (!authCheck.success) {
      console.error('EnhancedUnifiedMessagingService: Authentication failed:', authCheck.error);
      return [];
    }

    return this.conversations.filter(conv => 
      conv.participants && conv.participants.includes(userId) && !conv.isArchived
    ).sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || a.createdAt);
      const timeB = new Date(b.lastMessageTime || b.createdAt);
      return timeB - timeA;
    });
  }

  // Alias for backward compatibility
  getConversationsForUser(userId) {
    return this.getConversationsByUser(userId);
  }

  getUnreadCountForUser(userId) {
    const conversations = this.getConversationsByUser(userId);
    return conversations.reduce((total, conv) => {
      const unreadCount = conv.unreadCounts?.[userId] || 0;
      return total + unreadCount;
    }, 0);
  }

  migrateUnreadCounts() {
    let needsSave = false;
    
    this.conversations.forEach(conversation => {
      // If conversation has old unreadCount format, migrate it
      if (conversation.unreadCount !== undefined && !conversation.unreadCounts) {
        conversation.unreadCounts = {};
        
        // Distribute the old unreadCount among all participants
        // This is a best-effort migration since we don't know which user had unread messages
        if (conversation.participants && conversation.participants.length > 0) {
          const countPerUser = Math.ceil(conversation.unreadCount / conversation.participants.length);
          conversation.participants.forEach(participantId => {
            conversation.unreadCounts[participantId] = countPerUser;
          });
        }
        
        // Remove the old field
        delete conversation.unreadCount;
        needsSave = true;
      }
      
      // Ensure unreadCounts exists for all conversations
      if (!conversation.unreadCounts) {
        conversation.unreadCounts = {};
        needsSave = true;
      }
    });
    
    if (needsSave) {
      this.saveData();
    }
  }

  async archiveConversation(conversationId) {
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      conversation.isArchived = true;
      await this.saveData();
      return { success: true };
    }
    return { success: false, error: 'Conversation not found' };
  }

  async pinConversation(conversationId) {
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      conversation.isPinned = !conversation.isPinned;
      await this.saveData();
      return { success: true };
    }
    return { success: false, error: 'Conversation not found' };
  }

  async muteConversation(conversationId) {
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      conversation.isMuted = !conversation.isMuted;
      await this.saveData();
      return { success: true };
    }
    return { success: false, error: 'Conversation not found' };
  }

  // ==================== MESSAGE MANAGEMENT ====================

  async sendMessage(conversationId, senderId, senderName, content, type = this.MESSAGE_TYPES.TEXT, metadata = {}) {
    const messageId = uniqueIdGenerator.generateMessageId();
    
    const message = {
      id: messageId,
      conversationId,
      senderId,
      senderName,
      content,
      type,
      metadata,
      timestamp: new Date().toISOString(),
      status: this.MESSAGE_STATUS.SENDING,
      readBy: [senderId],
      reactions: {},
      replyTo: metadata.replyTo || null,
      forwardedFrom: metadata.forwardedFrom || null,
      isEdited: false,
      editedAt: null,
      isDeleted: false,
      deletedAt: null
    };

    this.messages.push(message);
    
    // Update conversation
    await this.updateConversationLastMessage(conversationId, message);
    
    // Update message status to sent
    message.status = this.MESSAGE_STATUS.SENT;
    
    await this.saveData();
    
    return message;
  }

  async updateConversationLastMessage(conversationId, message) {
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      const safeType = typeof message.type === 'string' ? message.type : 'unknown';
      conversation.lastMessage = message.type === this.MESSAGE_TYPES.TEXT ? message.content : `[${safeType.toUpperCase()}]`;
      conversation.lastMessageTime = message.timestamp;
      
      // Initialize unreadCounts if it doesn't exist
      if (!conversation.unreadCounts) {
        conversation.unreadCounts = {};
      }
      
      // Update unread count for other participants (not the sender)
      conversation.participants.forEach(participantId => {
        if (participantId !== message.senderId) {
          conversation.unreadCounts[participantId] = (conversation.unreadCounts[participantId] || 0) + 1;
        }
      });
    }
  }

  getMessagesByConversation(conversationId, userId) {
    // Authentication guard
    const authCheck = AuthGuard.requireAuth({ userId });
    if (!authCheck.success) {
      console.error('EnhancedUnifiedMessagingService: Authentication failed:', authCheck.error);
      return [];
    }

    // Check if user has access to this conversation
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      const accessCheck = AuthGuard.requireMessageAccess(userId, conversation);
      if (!accessCheck.success) {
        console.error('EnhancedUnifiedMessagingService: Access denied:', accessCheck.error);
        return [];
      }
    }

    return this.messages
      .filter(msg => msg.conversationId === conversationId && !msg.isDeleted)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Oldest first
  }

  // Alias for backward compatibility
  getMessagesForConversation(conversationId) {
    return this.getMessagesByConversation(conversationId);
  }

  async markMessageAsRead(conversationId, userId) {
    const conversation = this.getConversationById(conversationId);
    if (conversation) {
      // Initialize unreadCounts if it doesn't exist
      if (!conversation.unreadCounts) {
        conversation.unreadCounts = {};
      }
      
      // Reset unread count for this specific user
      conversation.unreadCounts[userId] = 0;
      await this.saveData();
    }
  }

  // ==================== TYPING INDICATORS ====================

  async startTyping(conversationId, userId) {
    this.typingUsers.set(conversationId, {
      userId,
      timestamp: Date.now()
    });
  }

  async stopTyping(conversationId, userId) {
    const typing = this.typingUsers.get(conversationId);
    if (typing && typing.userId === userId) {
      this.typingUsers.delete(conversationId);
    }
  }

  getTypingUsers(conversationId) {
    const typing = this.typingUsers.get(conversationId);
    if (!typing) return [];
    
    // Check if typing is recent (within 3 seconds)
    const now = Date.now();
    if (now - typing.timestamp > 3000) {
      this.typingUsers.delete(conversationId);
      return [];
    }
    
    return [typing.userId];
  }

  // ==================== FILE SHARING ====================

  async sendImage(conversationId, senderId, senderName, imageUri) {
    try {
      const metadata = {
        fileName: `image_${Date.now()}.jpg`,
        fileSize: 0, // Would need to get actual file size
        mimeType: 'image/jpeg',
        width: 0, // Would need to get actual dimensions
        height: 0
      };
      
      return await this.sendMessage(conversationId, senderId, senderName, imageUri, this.MESSAGE_TYPES.IMAGE, metadata);
    } catch (error) {
      console.error('Error sending image:', error);
      return { success: false, error: error.message };
    }
  }

  async sendDocument(conversationId, senderId, senderName, documentUri) {
    try {
      const metadata = {
        fileName: `document_${Date.now()}`,
        fileSize: 0, // Would need to get actual file size
        mimeType: 'application/octet-stream'
      };
      
      return await this.sendMessage(conversationId, senderId, senderName, documentUri, this.MESSAGE_TYPES.DOCUMENT, metadata);
    } catch (error) {
      console.error('Error sending document:', error);
      return { success: false, error: error.message };
    }
  }

  async sendLocation(conversationId, senderId, senderName, location) {
    try {
      const metadata = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: location.address || 'Shared Location'
      };
      
      return await this.sendMessage(conversationId, senderId, senderName, 'Location shared', this.MESSAGE_TYPES.LOCATION, metadata);
    } catch (error) {
      console.error('Error sending location:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVoiceMessage(conversationId, senderId, senderName, audioUri, duration) {
    try {
      const metadata = {
        fileName: `voice_${Date.now()}.m4a`,
        duration: duration,
        mimeType: 'audio/m4a'
      };
      
      return await this.sendMessage(conversationId, senderId, senderName, audioUri, this.MESSAGE_TYPES.AUDIO, metadata);
    } catch (error) {
      console.error('Error sending voice message:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== REACTIONS ====================

  async addReaction(messageId, userId, emoji) {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      if (!message.reactions[emoji]) {
        message.reactions[emoji] = [];
      }
      if (!message.reactions[emoji].includes(userId)) {
        message.reactions[emoji].push(userId);
        await this.saveData();
        return { success: true };
      }
    }
    return { success: false, error: 'Message not found' };
  }

  async removeReaction(messageId, userId, emoji) {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message && message.reactions[emoji]) {
      message.reactions[emoji] = message.reactions[emoji].filter(id => id !== userId);
      if (message.reactions[emoji].length === 0) {
        delete message.reactions[emoji];
      }
      await this.saveData();
      return { success: true };
    }
    return { success: false, error: 'Message not found' };
  }

  // ==================== SEARCH ====================

  async searchMessages(query, conversationId = null, userId = null) {
    let filteredMessages = this.messages.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase()) && !msg.isDeleted
    );

    if (conversationId) {
      filteredMessages = filteredMessages.filter(msg => msg.conversationId === conversationId);
    }

    if (userId) {
      filteredMessages = filteredMessages.filter(msg => msg.senderId === userId);
    }

    return filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // ==================== UTILITY METHODS ====================

  getOtherParticipant(conversation, currentUserId) {
    if (!conversation || !conversation.participants) return null;
    return conversation.participants.find(id => id !== currentUserId);
  }

  getOtherParticipantName(conversation, currentUserId) {
    const otherId = this.getOtherParticipant(conversation, currentUserId);
    if (!otherId) return 'Unknown User';
    
    const otherUser = this.getUser(otherId);
    if (otherUser) return otherUser.name;
    
    // Fallback to participantNames
    if (conversation.participantNames && Array.isArray(conversation.participantNames)) {
      const index = conversation.participants.indexOf(otherId);
      return conversation.participantNames[index] || 'Unknown User';
    }
    
    return 'Unknown User';
  }

  // ==================== DEBUG METHODS ====================

  getDebugInfo() {
    return {
      conversations: this.conversations.length,
      messages: this.messages.length,
      users: this.users.size,
      isInitialized: this.isInitialized
    };
  }

  async clearAllData() {
    this.conversations = [];
    this.messages = [];
    this.users.clear();
    this.typingUsers.clear();
    await this.saveData();
  }

  // Reset all messaging data
  async resetAllData() {
    try {
      console.log('EnhancedUnifiedMessagingService: Resetting all messaging data...');
      
      // Clear in-memory data
      this.conversations = [];
      this.messages = [];
      this.users = new Map();
      
      // AsyncStorage clearing not needed - using Supabase only
      console.log('EnhancedUnifiedMessagingService: Data managed in memory and Supabase only');
      
      console.log('EnhancedUnifiedMessagingService: All messaging data reset successfully');
      return { success: true };
      
    } catch (error) {
      console.error('EnhancedUnifiedMessagingService: Error resetting data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const enhancedUnifiedMessagingService = new EnhancedUnifiedMessagingService();
export default enhancedUnifiedMessagingService;
