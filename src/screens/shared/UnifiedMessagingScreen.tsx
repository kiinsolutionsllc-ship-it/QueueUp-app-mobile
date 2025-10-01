import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import { formatJobTitle, capitalizeText } from '../../utils/UnifiedJobFormattingUtils';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { ConversationModal } from '../../components/modals';
import { Conversation, Message } from '../../types/MessagingTypes';

// Message interface imported from MessagingTypes to avoid conflicts


interface UnifiedMessagingScreenProps {
  navigation: any;
  route?: any;
  conversations?: Conversation[];
  onConversationSelect?: (conversation: Conversation) => void;
}

const UnifiedMessagingScreen: React.FC<UnifiedMessagingScreenProps> = ({ 
  navigation, 
  conversations: propConversations, 
  onConversationSelect: propOnConversationSelect 
}) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  const [activeTab, setActiveTab] = useState<'conversations' | 'chat'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showConversationModal, setShowConversationModal] = useState<boolean>(false);

  // Use prop conversations or start with empty array
  const conversations: Conversation[] = propConversations || [];


  // Load persisted messages on component mount
  useEffect(() => {
    const loadPersistedMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem('persisted_messages');
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          Object.assign(globalMessages, parsedMessages);
        }
      } catch (error) {
        console.error('Error loading persisted messages:', error);
      }
    };
    
    loadPersistedMessages();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Load existing messages for this conversation
      const existingMessages = globalMessages[selectedConversation.id] || [];
      setMessages(existingMessages);
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      text: newMessage.trim(),
      content: newMessage.trim(),
      senderId: user?.id || 'current',
      senderName: user?.name || 'You',
      senderRole: user?.user_type === 'mechanic' ? 'mechanic' : 'customer',
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent',
      isRead: true,
    };

    // Add to local messages state
    setMessages(prev => [...prev, message]);
    
    // Store in global messages
    if (!globalMessages[selectedConversation.id]) {
      globalMessages[selectedConversation.id] = [];
    }
    globalMessages[selectedConversation.id].push(message);
    
    // Persist messages to AsyncStorage
    AsyncStorage.setItem('persisted_messages', JSON.stringify(globalMessages)).catch(console.error);
    
    // Update conversation's last message
    const convKey = Object.keys(globalConversations).find(key => 
      globalConversations[key].id === selectedConversation.id
    );
    if (convKey) {
      globalConversations[convKey] = {
        ...globalConversations[convKey],
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    setNewMessage('');
  };

  const handleConversationSelect = (conversation: Conversation) => {
    if (propOnConversationSelect) {
      propOnConversationSelect(conversation);
    } else {
      setSelectedConversation(conversation);
      setShowConversationModal(true);
    }
  };

  const handleBackToConversations = () => {
    setActiveTab('conversations');
    setSelectedConversation(null);
  };

  // Handle notifications icon
  const handleNotifications = useCallback(() => {
    navigation.navigate('Notifications');
  }, [navigation]);

  // Handle profile icon
  const handleProfile = useCallback(() => {
    navigation.navigate('Profile');
  }, [navigation]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const ConversationCard = ({ conversation }: { conversation: Conversation }) => (
    <TouchableOpacity
      style={[styles.conversationCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => handleConversationSelect(conversation)}
    >
      <View style={styles.conversationHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>👤</Text>
          <View style={[styles.onlineIndicator, { backgroundColor: theme.success }]} />
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationNameRow}>
            <View style={styles.nameAndJobRow}>
              <Text style={[styles.conversationName, { color: theme.text }]}>
                {capitalizeText(conversation.title)}
              </Text>
              {conversation.metadata?.jobTitle && (
                <>
                  <Text style={[styles.jobSeparator, { color: theme.textSecondary }]}> • </Text>
                  <Text style={[styles.jobTitle, { color: theme.textSecondary }]}>
                    {formatJobTitle(conversation.metadata.jobTitle)}
                  </Text>
                </>
              )}
              {conversation.jobId && (
                <>
                  <Text style={[styles.jobSeparator, { color: theme.textSecondary }]}> • </Text>
                  <Text style={[styles.jobId, { color: theme.textSecondary }]}>
                    #{conversation.jobId.slice(-6)}
                  </Text>
                </>
              )}
            </View>
            <Text style={[styles.conversationTime, { color: theme.textSecondary }]}>
              {formatTime(conversation.lastMessageTime)}
            </Text>
          </View>
          <View style={styles.lastMessageRow}>
            <Text 
              style={[
                styles.lastMessageText, 
                { 
                  color: conversation.unreadCounts[user?.id || ''] > 0 ? theme.text : theme.textSecondary,
                  fontWeight: conversation.unreadCounts[user?.id || ''] > 0 ? '600' : '400'
                }
              ]}
              numberOfLines={1}
            >
              {conversation.lastMessage}
            </Text>
            {conversation.unreadCounts[user?.id || ''] > 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.unreadCount, { color: theme.onPrimary }]}>
                  {conversation.unreadCounts[user?.id || '']}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const MessageBubble = ({ message }: { message: Message }) => {
    const isOwnMessage = message.senderId === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isOwnMessage ? theme.primary : theme.surface,
            borderColor: isOwnMessage ? theme.primary : theme.border,
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? theme.onPrimary : theme.text }
          ]}>
            {message.text}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isOwnMessage ? theme.onPrimary + '80' : theme.textSecondary }
          ]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (activeTab === 'conversations') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ModernHeader
          title="Messages"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />

        <View style={styles.conversationsContainer}>
          {conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <IconFallback name="message" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No conversations yet
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.textSecondary }]}>
                Start a conversation with a {user?.role === 'customer' ? 'mechanic' : 'customer'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ConversationCard conversation={item} />}
              contentContainerStyle={styles.conversationsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ModernHeader
        title={selectedConversation?.title ? capitalizeText(selectedConversation.title) : 'Chat'}
        showBack={true}
        onBackPress={handleBackToConversations}
        onNotificationPress={handleNotifications}
        onProfilePress={handleProfile}
      />

      <View style={styles.chatContainer}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.messageInputContainer, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={[styles.emojiButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <MaterialIcons name="emoji-emotions" size={24} color={theme.primary} />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: theme.cardBackground,
                color: theme.text,
                borderColor: theme.border,
              }
            ]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: newMessage.trim() ? theme.primary : theme.border,
                opacity: newMessage.trim() ? 1 : 0.5
              }
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <MaterialIcons 
              name="send" 
              size={20} 
              color={newMessage.trim() ? theme.onPrimary : theme.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Global conversation storage to share between users
const globalConversations: { [key: string]: Conversation } = {};
const globalMessages: { [key: string]: Message[] } = {};

// Add the ConversationModal component
const UnifiedMessagingScreenWithModal: React.FC<UnifiedMessagingScreenProps> = (props) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showConversationModal, setShowConversationModal] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Initialize conversations data - load from persistent storage
  useEffect(() => {
    const loadPersistedConversations = async () => {
      try {
        // Try to load from AsyncStorage first
        const storedConversations = await AsyncStorage.getItem('persisted_conversations');
        if (storedConversations) {
          const parsedConversations = JSON.parse(storedConversations);
          setConversations(parsedConversations);
          
          // Also populate global storage for current session
          parsedConversations.forEach((conv: Conversation) => {
            const convKey = `${conv.jobId}-${conv.participants.sort().join('-')}`;
            globalConversations[convKey] = conv;
          });
        } else {
          // Fallback to global storage
          const globalConvs = Object.values(globalConversations);
          setConversations(globalConvs);
        }
      } catch (error) {
        console.error('Error loading persisted conversations:', error);
        // Fallback to global storage
        const globalConvs = Object.values(globalConversations);
        setConversations(globalConvs);
      }
    };
    
    loadPersistedConversations();
  }, [user?.id]);

  // Set up notification listeners
  useEffect(() => {
    // Handle notification received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // You can handle foreground notifications here if needed
    });

    // Handle notification responses (when user taps notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      
      if (data?.conversationId) {
        // Find the conversation and open it
        const conversation = conversations.find(conv => conv.id === data.conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
          setShowConversationModal(true);
        }
      }
    });

    return () => {
      // Remove listeners using the correct method
      notificationListener.remove();
      responseListener.remove();
    };
  }, [conversations]);

  // Helper: find or create a conversation by jobId and participants
  const findOrCreateLocalConversation = useCallback((participants: string[], jobId: string, title?: string, jobTitle?: string) => {
    if (!participants || participants.length < 2 || !jobId) return null;

    // Ensure current user is included
    const currentUserId = getFallbackUserIdWithTypeDetection(user?.id, user?.user_type);
    const normalizedParticipants = Array.from(new Set([...
      participants,
      currentUserId,
    ]));

    // Create a unique key for this conversation
    const convKey = `${jobId}-${normalizedParticipants.sort().join('-')}`;

    // Try to find existing conversation in global storage
    if (globalConversations[convKey]) {
      return globalConversations[convKey];
    }

    // Create new conversation
    const newConv: Conversation = {
      id: `conv-${jobId}-${Date.now()}`,
      participants: normalizedParticipants,
      jobId,
      type: 'job_related',
      title: title || 'Conversation',
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCounts: {},
      isPinned: false,
      isArchived: false,
      isMuted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        jobTitle: jobTitle || title || '',
        customerName: title?.includes('Customer') ? title : undefined,
        mechanicName: title?.includes('Mechanic') ? title : undefined,
      },
    };

    // Store in global storage
    globalConversations[convKey] = newConv;
    globalMessages[newConv.id] = [];

    // Update local state
    setConversations(prev => {
      const updated = [newConv, ...prev];
      // Persist to AsyncStorage
      AsyncStorage.setItem('persisted_conversations', JSON.stringify(updated)).catch(console.error);
      return updated;
    });
    return newConv;
  }, [user?.id, user?.user_type]);

  // If navigated here with params to start a conversation, ensure it exists and open modal
  useEffect(() => {
    const params = (props as any)?.route?.params;
    if (params?.startConversation) {
      const { participants, jobId, title, jobTitle } = params.startConversation;
      console.log('UnifiedMessagingScreen - Creating conversation with:', { participants, jobId, title, jobTitle });
      const conv = findOrCreateLocalConversation(participants, jobId, title, jobTitle);
      if (conv) {
        console.log('UnifiedMessagingScreen - Created conversation:', conv);
        setSelectedConversation(conv);
        setShowConversationModal(true);
      }
    }
  }, [props, findOrCreateLocalConversation]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationModal(true);
  };

  // Send notification for new messages
  const sendMessageNotification = useCallback(async (message: string, conversation: Conversation) => {
    try {
      // Get sender info
      const currentUserId = getFallbackUserIdWithTypeDetection(user?.id, user?.user_type);
      const senderRole = user?.role || 'customer';
      const senderName = senderRole === 'customer' ? 'Customer' : 'Mechanic';
      const jobTitle = conversation.metadata?.jobTitle || 'Service Request';
      
      // Find the recipient (the other participant in the conversation)
      const recipientId = conversation.participants.find((id: string) => id !== currentUserId);
      
      if (!recipientId) {
        console.warn('No recipient found for message notification');
        return;
      }

      // Import NotificationService dynamically to avoid circular dependencies
      const NotificationService = (await import('../../services/NotificationService')).default;
      
      // Send in-app notification to the recipient
      await NotificationService.createNotification({
        userId: recipientId,
        type: 'new_message',
        title: `New message from ${senderName}`,
        message: message,
        jobId: conversation.jobId,
        conversationId: conversation.id,
        priority: 'medium',
        actionRequired: false,
        category: 'message',
        data: {
          conversationId: conversation.id,
          jobId: conversation.jobId,
          jobTitle: jobTitle,
          senderId: currentUserId,
          senderRole: senderRole,
          senderName: senderName,
          messageContent: message,
        }
      });

      // Also send local push notification for immediate visibility
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `New message from ${senderName}`,
          body: message,
          data: {
            conversationId: conversation.id,
            jobId: conversation.jobId,
            jobTitle: jobTitle,
            senderId: currentUserId,
            senderRole: senderRole,
          },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });

      console.log('Message notification sent to recipient:', recipientId, 'Content:', message);
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }, [user?.id, user?.user_type, user?.role]);

  const handleMessageSent = (newMessage?: string) => {
    // Update the conversation's last message and timestamp
    if (selectedConversation && newMessage) {
      // Update global conversation
      const convKey = Object.keys(globalConversations).find(key => 
        globalConversations[key].id === selectedConversation.id
      );
      if (convKey) {
        globalConversations[convKey] = {
          ...globalConversations[convKey],
          lastMessage: newMessage,
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Update local state
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.id === selectedConversation.id 
            ? {
                ...conv,
                lastMessage: newMessage,
                lastMessageTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : conv
        );
        // Persist to AsyncStorage
        AsyncStorage.setItem('persisted_conversations', JSON.stringify(updated)).catch(console.error);
        return updated;
      });

      // Send notification
      sendMessageNotification(newMessage, selectedConversation);
    }
    console.log('Message sent in conversation modal');
  };

  return (
    <>
      <UnifiedMessagingScreen {...props} conversations={conversations} onConversationSelect={handleConversationSelect} />
      
      <ConversationModal
        visible={showConversationModal}
        onClose={() => setShowConversationModal(false)}
        conversation={selectedConversation}
        onMessageSent={handleMessageSent}
        user={user}
        theme={theme}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conversationsContainer: {
    flex: 1,
    padding: 16,
  },
  conversationsList: {
    gap: 12,
  },
  conversationCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 32,
    width: 48,
    height: 48,
    borderRadius: 24,
    textAlign: 'center',
    lineHeight: 48,
    backgroundColor: '#f0f0f0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameAndJobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
  },
  jobSeparator: {
    fontSize: 16,
    fontWeight: '600',
  },
  jobTitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  jobId: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  conversationTime: {
    fontSize: 12,
  },
  lastMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessageText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    gap: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    textAlign: 'right',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  emojiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UnifiedMessagingScreenWithModal;
