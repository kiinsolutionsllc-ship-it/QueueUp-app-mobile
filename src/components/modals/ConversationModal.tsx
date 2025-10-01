import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { ConversationModalProps, Message } from '../../types/MessagingTypes';
import { User } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getFallbackUserIdWithTypeDetection } from '../../utils/UserIdUtils';
import { formatJobTitle, capitalizeText } from '../../utils/UnifiedJobFormattingUtils';
import IconFallback from '../shared/IconFallback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ConversationModal: React.FC<ConversationModalProps> = ({
  visible,
  onClose,
  conversation,
  onMessageSent,
  user,
  theme: propTheme,
}) => {
  const { getCurrentTheme } = useTheme();
  const theme = propTheme || getCurrentTheme();
  const styles = createStyles(theme);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Message storage key for persistence
  const getStorageKey = (conversationId: string) => `messages_${conversationId}`;

  // Send notification when message is received
  const sendMessageNotification = useCallback(async (message: Message, conversation: any) => {
    try {
      // Only send notification if the modal is not visible (user is not actively viewing the conversation)
      if (visible) return;

      // Get sender name and recipient info
      const senderName = message.senderRole === 'customer' ? 'Customer' : 'Mechanic';
      const jobTitle = conversation.metadata?.jobTitle || 'Service Request';
      
      // Find the recipient (the other participant in the conversation)
      const recipientId = conversation.participants.find((id: string) => id !== message.senderId);
      
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
        message: message.content,
        jobId: conversation.jobId,
        conversationId: conversation.id,
        priority: 'medium',
        actionRequired: false,
        category: 'message',
        data: {
          conversationId: conversation.id,
          jobId: conversation.jobId,
          jobTitle: jobTitle,
          senderId: message.senderId,
          senderRole: message.senderRole,
          senderName: senderName,
          messageContent: message.content,
        }
      });

      // Also send local push notification for immediate visibility
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `New message from ${senderName}`,
          body: message.content,
          data: {
            conversationId: conversation.id,
            jobId: conversation.jobId,
            jobTitle: jobTitle,
            senderId: message.senderId,
            senderRole: message.senderRole,
          },
          sound: 'default',
        },
        trigger: null, // Show immediately
      });

      console.log('Message notification sent to recipient:', recipientId, 'Content:', message.content);
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }, [visible]);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // No mock messages - conversations start empty

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // Load messages when conversation changes
  useEffect(() => {
    if (conversation && visible) {
      setIsLoading(true);
      
      // Try to load persisted messages for this conversation
      const loadPersistedMessages = async () => {
        try {
          // Try AsyncStorage first (persistent storage)
          const storageKey = getStorageKey(conversation.id);
          const storedMessages = await AsyncStorage.getItem(storageKey);
          
          if (storedMessages) {
            const parsedMessages = JSON.parse(storedMessages);
            setMessages(parsedMessages);
          } else {
            // Fallback to global message storage (in-memory)
            const globalMessages = (global as any).__globalMessages?.[conversation.id] || [];
            if (globalMessages.length > 0) {
              setMessages(globalMessages);
            } else {
              // Fallback to old local storage
              const persistedMessages = (global as any).__conversationMessages?.[storageKey] || [];
              setMessages(persistedMessages);
            }
          }
          
          setIsLoading(false);
          
          // Scroll to bottom
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } catch (error) {
          console.error('Error loading messages:', error);
          setMessages([]);
          setIsLoading(false);
        }
      };
      
      loadPersistedMessages();
    }
  }, [conversation?.id, visible]);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversation) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: conversation.id,
      content: newMessage.trim(),
      senderId: getFallbackUserIdWithTypeDetection(user?.id, user?.role as 'customer' | 'mechanic'),
      senderRole: user?.role || 'customer',
      status: 'sent',
      timestamp: new Date().toISOString(),
      type: 'text',
    };

    // Add message to local state
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    setNewMessage('');

    // Persist messages to storage
    try {
      const storageKey = getStorageKey(conversation.id);
      
      // Store in AsyncStorage (persistent storage)
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedMessages));
      
      // Also store in global message storage (shared between users in current session)
      if (!(global as any).__globalMessages) {
        (global as any).__globalMessages = {};
      }
      (global as any).__globalMessages[conversation.id] = updatedMessages;
      
      // Also store in old local storage as backup
      if (!(global as any).__conversationMessages) {
        (global as any).__conversationMessages = {};
      }
      (global as any).__conversationMessages[storageKey] = updatedMessages;
    } catch (error) {
      console.error('Error persisting messages:', error);
    }

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Message sent successfully - no auto-response needed

    // Notify parent with the message content
    onMessageSent(message.content || '');

    // Send notification to the other participant
    if (conversation) {
      sendMessageNotification(message, conversation);
    }
  }, [newMessage, conversation, user, onMessageSent, sendMessageNotification]);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  // Render message bubble
  const renderMessage = useCallback(({ item }: { item: Message }) => {
    // Use role for consistency with AuthContext
    const currentUserId = getFallbackUserIdWithTypeDetection(user?.id, user?.role as 'customer' | 'mechanic');
    const isMyMessage = item.senderId === currentUserId;
    const messageTime = new Date(item.timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {messageTime}
          </Text>
        </View>
      </View>
    );
  }, [user, styles]);

  // Render typing indicator
  const renderTypingIndicator = useCallback(() => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={[styles.messageBubble, styles.otherMessageBubble]}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { backgroundColor: theme.textSecondary }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.textSecondary }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.textSecondary }]} />
          </View>
        </View>
      </View>
    );
  }, [isTyping, theme, styles]);

  // Render emoji picker
  const renderEmojiPicker = useCallback(() => {
    if (!showEmojiPicker) return null;

    const commonEmojis = ['😊', '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏', '🔥'];

    return (
      <View style={styles.emojiPicker}>
        <View style={styles.emojiPickerHeader}>
          <Text style={styles.emojiPickerTitle}>Choose Emoji</Text>
          <TouchableOpacity onPress={() => setShowEmojiPicker(false)}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emojiGrid}>
          {commonEmojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiButton}
              onPress={() => handleEmojiSelect(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [showEmojiPicker, theme, styles, handleEmojiSelect]);

  if (!conversation) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {'👤'}
              </Text>
            </View>
            <View style={styles.headerText}>
              <View style={styles.nameAndJobRow}>
                <Text style={[styles.participantName, { color: theme.text }]}>
                  {capitalizeText(conversation.title || conversation.metadata?.customerName || conversation.metadata?.mechanicName || 'Customer')}
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
            </View>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderTypingIndicator}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        </View>

        {/* Emoji Picker */}
        {renderEmojiPicker()}

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <TouchableOpacity
            style={styles.emojiButton}
            onPress={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Ionicons name="happy-outline" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, { 
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.border,
            }]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: newMessage.trim() ? theme.primary : theme.border,
              }
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={newMessage.trim() ? theme.onPrimary : theme.textSecondary} 
            />
          </TouchableOpacity>
        </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
  },
  headerText: {
    flex: 1,
  },
  nameAndJobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  participantName: {
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
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: screenWidth * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: theme.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: theme.onPrimary,
  },
  otherMessageText: {
    color: theme.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: theme.onPrimary + 'CC',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: theme.textSecondary,
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  emojiPicker: {
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  emojiPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emojiText: {
    fontSize: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
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

export default ConversationModal;
