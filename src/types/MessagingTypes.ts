import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';

// Core messaging types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string; // Display name of the sender
  senderRole: 'customer' | 'mechanic' | 'admin';
  content: string;
  text?: string; // Alias for content for backward compatibility
  type: MessageType;
  status: MessageStatus;
  isRead?: boolean; // Whether the message has been read
  timestamp: string;
  metadata?: MessageMetadata;
  reactions?: MessageReaction[];
  replyTo?: string; // Message ID being replied to
  editedAt?: string;
  deletedAt?: string;
}

export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'location' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageMetadata {
  duration?: number; // For audio messages
  fileSize?: number; // For file messages
  fileName?: string; // For file messages
  mimeType?: string; // For file messages
  width?: number; // For image/video messages
  height?: number; // For image/video messages
  coordinates?: {
    latitude: number;
    longitude: number;
  }; // For location messages
  address?: string; // For location messages
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  jobId?: string;
  type: ConversationType;
  title?: string;
  lastMessage?: string;
  lastMessageTime: string;
  unreadCounts: Record<string, number>;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: ConversationMetadata;
}

export type ConversationType = 'job_related' | 'general' | 'support' | 'group';

export interface ConversationMetadata {
  jobTitle?: string;
  customerName?: string;
  mechanicName?: string;
  vehicleInfo?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

// User types
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'mechanic' | 'admin';
  isOnline?: boolean;
  lastSeen?: string;
  status?: UserStatus;
}

export type UserStatus = 'available' | 'busy' | 'away' | 'offline';

// Navigation types
export interface MessagingNavigationProp {
  navigate: (screen: string, params?: MessagingRouteParams) => void;
  goBack: () => void;
  setParams: (params: Partial<MessagingRouteParams>) => void;
  addListener: (event: string, callback: (data: any) => void) => () => void;
  canGoBack: () => boolean;
  dispatch: (action: any) => void;
  reset: (state: any) => void;
  isFocused: () => boolean;
}

export interface MessagingRouteProp extends RouteProp<any, string> {
  params?: MessagingRouteParams;
}

export interface MessagingRouteParams {
  conversationId?: string;
  jobId?: string;
  otherUserId?: string;
  otherUserName?: string;
  targetUserId?: string;
  targetUserName?: string;
  currentUserId?: string;
  currentUserName?: string;
}

// Component prop types
export interface UnifiedMessagingScreenProps {
  navigation: MessagingNavigationProp;
  route: MessagingRouteProp;
}

export interface ConversationModalProps {
  visible: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onMessageSent: (messageContent?: string) => void;
  user?: User;
  theme?: Theme;
}

export interface MessageBubbleProps {
  message: Message;
  isMyMessage: boolean;
  theme: Theme;
  onLongPress?: (message: Message) => void;
  onReactionPress?: (message: Message, emoji: string) => void;
  onReplyPress?: (message: Message) => void;
  onEditPress?: (message: Message) => void;
  onDeletePress?: (message: Message) => void;
}

export interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  onImagePress: () => void;
  onCameraPress: () => void;
  onFilePress: () => void;
  onLocationPress: () => void;
  theme: Theme;
}

export interface QuickRepliesProps {
  visible: boolean;
  replies: string[];
  onReplyPress: (reply: string) => void;
  onClose: () => void;
  theme: Theme;
}

export interface MessageOptionsProps {
  visible: boolean;
  message: Message | null;
  onClose: () => void;
  onReactPress: () => void;
  onReplyPress: () => void;
  onEditPress: () => void;
  onDeletePress: () => void;
  onCopyPress: () => void;
  canEdit: boolean;
  canDelete: boolean;
  theme: Theme;
}

export interface ReactionPickerProps {
  visible: boolean;
  onReactionPress: (emoji: string) => void;
  onClose: () => void;
  theme: Theme;
}

// Theme types
export interface Theme {
  primary: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  cardBackground: string;
  cardShadow: string;
  border: string;
  accent: string;
  accentLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  onPrimary: string;
  onBackground: string;
  onSurface: string;
  onSuccess: string;
  onWarning: string;
  onError: string;
  onInfo: string;
  divider: string;
}

// State types
export interface MessagingState {
  conversations: Conversation[];
  messages: Message[];
  selectedConversation: Conversation | null;
  showConversationModal: boolean;
  showConversationList: boolean;
  loading: boolean;
  refreshing: boolean;
  newMessage: string;
  inputHeight: number;
  isTyping: boolean;
  showAttachmentMenu: boolean;
  showReactionPicker: boolean;
  selectedMessageForReaction: Message | null;
  showMessageOptions: boolean;
  selectedMessageForOptions: Message | null;
  isRecording: boolean;
  recordingDuration: number;
  isRecordingPermissionGranted: boolean;
  recording: any; // Audio.Recording type
  showQuickReplies: boolean;
  isConversationSelectMode: boolean;
  selectedConversations: Set<string>;
  showContextMenu: string | null;
  contextMenuPosition: { x: number; y: number };
}

// Hook return types
export interface UseMessagingReturn {
  // State
  conversations: Conversation[];
  messages: Message[];
  selectedConversation: Conversation | null;
  loading: boolean;
  refreshing: boolean;
  
  // Actions
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, type?: MessageType) => Promise<void>;
  sendImage: (imageUri: string) => Promise<void>;
  sendAudio: (audioUri: string, duration: number) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, reactionId: string) => Promise<void>;
  
  // UI Actions
  handleConversationPress: (conversation: Conversation) => void;
  handleCloseModal: () => void;
  handleTyping: (text: string) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  toggleConversationSelection: (conversationId: string) => void;
  
  // Utility functions
  formatTime: (timestamp: string) => string;
  formatDuration: (seconds: number) => string;
  isMyMessage: (message: Message) => boolean;
  getOtherParticipant: (conversation: Conversation) => string;
}

// Service types
export interface MessagingService {
  getConversationsByUser: (userId: string) => Promise<Conversation[]>;
  getMessagesByConversation: (conversationId: string) => Promise<Message[]>;
  createConversation: (conversationData: Partial<Conversation>) => Promise<Conversation>;
  createMessage: (messageData: Partial<Message>) => Promise<Message>;
  updateMessage: (messageId: string, updates: Partial<Message>) => Promise<Message>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  addReaction: (messageId: string, reaction: MessageReaction) => Promise<void>;
  removeReaction: (messageId: string, reactionId: string) => Promise<void>;
}

// Error types
export interface MessagingError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
  delay?: number;
  tension?: number;
  friction?: number;
}

// Style types
export interface MessagingStyles {
  container: ViewStyle;
  keyboardContainer: ViewStyle;
  conversationList: ViewStyle;
  conversationListContent: ViewStyle;
  conversationItem: ViewStyle;
  avatar: ViewStyle;
  conversationContent: ViewStyle;
  conversationName: TextStyle;
  conversationLastMessage: TextStyle;
  conversationJobId: TextStyle;
  conversationMeta: ViewStyle;
  conversationTime: TextStyle;
  unreadBadge: ViewStyle;
  unreadText: TextStyle;
  messagesContainer: ViewStyle;
  messagesContent: ViewStyle;
  emptyContainer: ViewStyle;
  emptyIconContainer: ViewStyle;
  emptyTitle: TextStyle;
  emptySubtitle: TextStyle;
  messageContainer: ViewStyle;
  myMessageContainer: ViewStyle;
  otherMessageContainer: ViewStyle;
  messageBubble: ViewStyle;
  messageText: TextStyle;
  messageImage: ImageStyle;
  audioMessageContainer: ViewStyle;
  playButton: ViewStyle;
  audioInfo: ViewStyle;
  audioDuration: TextStyle;
  messageContent: ViewStyle;
  messageFooter: ViewStyle;
  messageTime: TextStyle;
  messageStatus: ViewStyle;
  typingContainer: ViewStyle;
  typingBubble: ViewStyle;
  typingDots: ViewStyle;
  typingDot: ViewStyle;
  inputContainer: ViewStyle;
  quickRepliesContainer: ViewStyle;
  quickReplyButton: ViewStyle;
  quickReplyText: TextStyle;
  inputRow: ViewStyle;
  attachmentButton: ViewStyle;
  inputWrapper: ViewStyle;
  textInput: TextStyle;
  quickRepliesButton: ViewStyle;
  sendButton: ViewStyle;
  recordingContainer: ViewStyle;
  recordingButton: ViewStyle;
  recordingDuration: TextStyle;
  modalOverlay: ViewStyle;
  attachmentMenu: ViewStyle;
  attachmentOption: ViewStyle;
  attachmentOptionText: TextStyle;
  messageOptions: ViewStyle;
  messageOption: ViewStyle;
  messageOptionText: TextStyle;
  dangerOption: ViewStyle;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types
export interface MessagingEvents {
  onMessageSent: (message: Message) => void;
  onMessageReceived: (message: Message) => void;
  onMessageRead: (messageId: string, userId: string) => void;
  onTypingStart: (conversationId: string, userId: string) => void;
  onTypingStop: (conversationId: string, userId: string) => void;
  onUserOnline: (userId: string) => void;
  onUserOffline: (userId: string) => void;
  onConversationCreated: (conversation: Conversation) => void;
  onConversationUpdated: (conversation: Conversation) => void;
  onError: (error: MessagingError) => void;
}

// Permission types
export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  location: boolean;
  storage: boolean;
}

// Quick reply types
export interface QuickReply {
  id: string;
  text: string;
  category: 'greeting' | 'status' | 'question' | 'confirmation' | 'custom';
  isDefault: boolean;
  usageCount: number;
  lastUsed?: string;
}

// Search and filter types
export interface ConversationFilter {
  type?: ConversationType;
  isUnread?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  participants?: string[];
  jobId?: string;
}

export interface MessageSearchResult {
  message: Message;
  conversation: Conversation;
  highlight: string;
  relevanceScore: number;
}

// Notification types
export interface MessagingNotification {
  id: string;
  type: 'message' | 'reaction' | 'typing' | 'online';
  conversationId: string;
  messageId?: string;
  fromUserId: string;
  toUserId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: string;
  isRead: boolean;
}


