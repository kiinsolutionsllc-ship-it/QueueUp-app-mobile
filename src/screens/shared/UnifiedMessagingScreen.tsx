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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { ConversationModal } from '../../components/modals';
import { Conversation, Message } from '../../types/MessagingTypes';

// Message interface imported from MessagingTypes to avoid conflicts


interface UnifiedMessagingScreenProps {
  navigation: any;
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

  // Use prop conversations or fallback to mock data
  const conversations: Conversation[] = propConversations || [
    {
      id: '1',
      participants: ['MECHANIC-20240125-143022-1234', getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)],
      jobId: 'job1',
      type: 'job_related',
      title: 'John Mechanic',
      lastMessage: 'I can help you with that brake issue',
      lastMessageTime: '2024-01-25T10:30:00Z',
      unreadCounts: { [getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)]: 2 },
      isPinned: false,
      isArchived: false,
      isMuted: false,
      createdAt: '2024-01-25T10:00:00Z',
      updatedAt: '2024-01-25T10:30:00Z',
      metadata: {
        jobTitle: 'Brake Repair',
        mechanicName: 'John Mechanic',
        vehicleInfo: '2020 Honda Civic',
        priority: 'medium',
      },
    },
    {
      id: '2',
      participants: ['CUSTOMER-20240125-143022-5678', getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)],
      jobId: 'job2',
      type: 'job_related',
      title: 'Sarah Customer',
      lastMessage: 'When can you come by?',
      lastMessageTime: '2024-01-25T09:15:00Z',
      unreadCounts: { [getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)]: 0 },
      isPinned: false,
      isArchived: false,
      isMuted: false,
      createdAt: '2024-01-25T09:00:00Z',
      updatedAt: '2024-01-25T09:15:00Z',
      metadata: {
        jobTitle: 'Oil Change',
        customerName: 'Sarah Customer',
        vehicleInfo: '2019 Toyota Camry',
        priority: 'low',
      },
    },
  ];

  // Mock messages data
  const mockMessages: Message[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      text: 'Hi! I need help with my car brakes',
      content: 'Hi! I need help with my car brakes',
      senderId: user?.id || 'CUSTOMER-20240125-143022-5678', // Internal ID
      senderName: user?.name || 'You', // Display name
      senderRole: 'customer',
      timestamp: '2024-01-25T10:00:00Z',
      type: 'text',
      status: 'read',
      isRead: true,
    },
    {
      id: '2',
      conversationId: 'conv-1',
      text: 'I can help you with that brake issue',
      content: 'I can help you with that brake issue',
      senderId: 'MECHANIC-20240125-143022-1234', // Internal ID
      senderName: 'John Mechanic', // Display name
      senderRole: 'mechanic',
      timestamp: '2024-01-25T10:30:00Z',
      type: 'text',
      status: 'sent',
      isRead: false,
    },
    {
      id: '3',
      conversationId: 'conv-1',
      text: 'Great! When are you available?',
      content: 'Great! When are you available?',
      senderId: user?.id || 'CUSTOMER-20240125-143022-5678', // Internal ID
      senderName: user?.name || 'You', // Display name
      senderRole: 'customer',
      timestamp: '2024-01-25T10:35:00Z',
      type: 'text',
      status: 'read',
      isRead: true,
    },
  ];

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation?.id || 'conv-1',
      text: newMessage.trim(),
      content: newMessage.trim(),
      senderId: user?.id || 'current',
      senderName: user?.name || 'You',
      senderRole: user?.user_type === 'mechanic' ? 'mechanic' : 'customer',
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending',
      isRead: true,
    };

    setMessages(prev => [...prev, message]);
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
            <Text style={[styles.conversationName, { color: theme.text }]}>
              {conversation.title}
            </Text>
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
        title={selectedConversation?.title || 'Chat'}
        showBack={true}
        onBackPress={handleBackToConversations}
        rightActions={[
          {
            icon: 'call',
            onPress: () => {
              // Call functionality - could integrate with phone dialer
              Alert.alert('Call', 'Call functionality would be implemented here');
            },
          },
          {
            icon: 'more-vert',
            onPress: () => {
              // More options menu - could show conversation settings, etc.
              Alert.alert('Options', 'More options would be available here');
            },
          },
        ]}
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

// Add the ConversationModal component
const UnifiedMessagingScreenWithModal: React.FC<UnifiedMessagingScreenProps> = (props) => {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const theme = getCurrentTheme();
  
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showConversationModal, setShowConversationModal] = useState<boolean>(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Initialize conversations data
  useEffect(() => {
    const initialConversations: Conversation[] = [
      {
        id: '1',
        participants: ['MECHANIC-20240125-143022-1234', getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)],
        jobId: 'job1',
        type: 'job_related',
        title: 'John Mechanic',
        lastMessage: 'I can help you with that brake issue',
        lastMessageTime: '2024-01-25T10:30:00Z',
        unreadCounts: { [getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)]: 2 },
        isPinned: false,
        isArchived: false,
        isMuted: false,
        createdAt: '2024-01-25T10:00:00Z',
        updatedAt: '2024-01-25T10:30:00Z',
        metadata: {
          jobTitle: 'Brake Repair',
          mechanicName: 'John Mechanic',
          vehicleInfo: '2020 Honda Civic',
          priority: 'medium',
        },
      },
      {
        id: '2',
        participants: ['CUSTOMER-20240125-143022-5678', getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)],
        jobId: 'job2',
        type: 'job_related',
        title: 'Sarah Customer',
        lastMessage: 'When can you come by?',
        lastMessageTime: '2024-01-25T09:15:00Z',
        unreadCounts: { [getFallbackUserIdWithTypeDetection(user?.id, user?.user_type)]: 0 },
        isPinned: false,
        isArchived: false,
        isMuted: false,
        createdAt: '2024-01-25T09:00:00Z',
        updatedAt: '2024-01-25T09:15:00Z',
        metadata: {
          jobTitle: 'Oil Change',
          customerName: 'Sarah Customer',
          vehicleInfo: '2019 Toyota Camry',
          priority: 'low',
        },
      },
    ];
    setConversations(initialConversations);
  }, [user?.id]);

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowConversationModal(true);
  };

  const handleMessageSent = (newMessage?: string) => {
    // Update the conversation's last message and timestamp
    if (selectedConversation && newMessage) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation.id 
            ? {
                ...conv,
                lastMessage: newMessage,
                lastMessageTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : conv
        )
      );
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
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
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
