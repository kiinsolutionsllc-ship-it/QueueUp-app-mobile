import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSupport } from '../../contexts/SupportContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { FadeIn, SlideInFromBottom } from '../../components/shared/Animations';
import { hapticService } from '../../services/HapticService';
import enhancedUnifiedMessagingService from '../../services/EnhancedUnifiedMessagingService';

const { width } = Dimensions.get('window');

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  agentId?: string;
  messages: SupportMessage[];
}

interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'agent';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface UnifiedSupportScreenProps {
  navigation: any;
}

export default function UnifiedSupportScreen({ navigation }: UnifiedSupportScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    supportTickets, 
    isLoadingTickets, 
    createTicket, 
    activeChatSession, 
    isChatConnected, 
    startChatSession, 
    endChatSession, 
    sendChatMessage,
    searchArticles,
    getPopularArticles 
  } = useSupport();
  const theme = getCurrentTheme();

  // State management
  const [activeTab, setActiveTab] = useState<'help' | 'tickets' | 'chat'>('help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [customIssue, setCustomIssue] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isRequesting, setIsRequesting] = useState(false);
  const [chatMessages, setChatMessages] = useState<SupportMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [autoCategory, setAutoCategory] = useState<any>(null);

  // Animation refs
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  // Enhanced FAQ with categories
  const faqCategories = {
    general: {
      title: 'General Questions',
      icon: 'help-outline',
      items: [
        {
          id: 'create-service-request',
          question: 'How do I create a service request?',
          answer: 'To create a service request, go to the Home screen and tap "Create Job". Fill in the details about your vehicle and the service needed, then submit your request. Mechanics in your area will be able to see and bid on your job.',
          tags: ['service', 'request', 'create', 'job'],
        },
        {
          id: 'find-mechanic',
          question: 'How do I find a mechanic?',
          answer: 'You can find mechanics by going to the Explore screen. You can search by specialty, location, or rating. Each mechanic profile shows their experience, ratings, and availability.',
          tags: ['mechanic', 'find', 'search', 'explore'],
        },
        {
          id: 'cancel-request',
          question: 'Can I cancel a service request?',
          answer: 'Yes, you can cancel a service request up to 24 hours before the scheduled service time. Go to your bookings and select the job you want to cancel.',
          tags: ['cancel', 'request', 'booking'],
        },
      ],
    },
    payment: {
      title: 'Payment & Billing',
      icon: 'payment',
      items: [
        {
          id: 'payment-process',
          question: 'How does payment work?',
          answer: 'Payments are processed securely through Stripe. You can add multiple payment methods in your settings. Payment is held in escrow until the service is completed and you confirm satisfaction.',
          tags: ['payment', 'stripe', 'escrow', 'billing'],
        },
        {
          id: 'refund-process',
          question: 'How do I get a refund?',
          answer: 'Refunds are processed automatically if a service is cancelled within the allowed timeframe. For other refund requests, contact our support team through this screen.',
          tags: ['refund', 'money', 'cancel'],
        },
      ],
    },
    technical: {
      title: 'Technical Support',
      icon: 'build',
      items: [
        {
          id: 'app-issues',
          question: 'The app is not working properly',
          answer: 'Try restarting the app, checking your internet connection, or updating to the latest version. If problems persist, report the issue through our bug reporting feature.',
          tags: ['app', 'bug', 'technical', 'crash'],
        },
        {
          id: 'login-problems',
          question: 'I cannot log into my account',
          answer: 'Try resetting your password or clearing the app cache. If you continue to have issues, contact support for account recovery assistance.',
          tags: ['login', 'password', 'account', 'access'],
        },
      ],
    },
  };

  // Issue categories (enhanced from CustomerServiceScreen)
  const issueCategories = [
    {
      id: 'billing',
      label: 'Billing & Payment',
      icon: 'payment',
      description: 'Questions about charges, refunds, or payment methods',
      emoji: '💳',
      popular: true,
      color: '#4CAF50',
    },
    {
      id: 'scheduling',
      label: 'Book or Reschedule',
      icon: 'schedule',
      description: 'Book new appointments or reschedule existing ones',
      emoji: '📅',
      popular: true,
      color: '#2196F3',
    },
    {
      id: 'vehicle_issues',
      label: 'Vehicle Service',
      icon: 'directions-car',
      description: 'Car problems, maintenance questions, or service updates',
      emoji: '🚗',
      popular: true,
      color: '#FF9800',
    },
    {
      id: 'technical',
      label: 'App Help',
      icon: 'build',
      description: 'App issues, login problems, or technical difficulties',
      emoji: '📱',
      popular: false,
      color: '#9C27B0',
    },
    {
      id: 'account',
      label: 'My Account',
      icon: 'person',
      description: 'Profile updates, password reset, or account settings',
      emoji: '👤',
      popular: false,
      color: '#607D8B',
    },
    {
      id: 'general',
      label: 'Something Else',
      icon: 'help',
      description: 'Other questions or concerns',
      emoji: '❓',
      popular: false,
      color: '#795548',
    },
  ];

  const priorityLevels = [
    {
      id: 'low',
      label: 'I can wait',
      color: theme.success,
      description: 'No rush - whenever you have time',
      emoji: '😊',
      estimatedTime: '2-4 hours',
    },
    {
      id: 'normal',
      label: 'Standard',
      color: theme.info,
      description: 'Normal priority - typical response time',
      emoji: '👍',
      estimatedTime: '30-60 minutes',
    },
    {
      id: 'high',
      label: 'I need help soon',
      color: theme.warning,
      description: 'Important - please respond quickly',
      emoji: '⚡',
      estimatedTime: '15-30 minutes',
    },
    {
      id: 'urgent',
      label: 'Emergency!',
      color: theme.error,
      description: 'Critical issue - immediate attention needed',
      emoji: '🚨',
      estimatedTime: '5-15 minutes',
    },
  ];

  // Tab animation
  useEffect(() => {
    const tabIndex = activeTab === 'help' ? 0 : activeTab === 'tickets' ? 1 : 2;
    Animated.spring(tabIndicatorAnim, {
      toValue: tabIndex * (width / 3),
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  // Load support tickets is now handled by the context

  // Smart search functionality using knowledge base
  const searchFAQ = async (query: string) => {
    if (!query.trim()) return [];
    
    try {
      const results = await searchArticles(query, undefined, 5);
      return results.map(result => ({
        id: result.article.id,
        question: result.article.title,
        answer: result.snippet,
        category: result.article.category,
        tags: result.article.tags,
      }));
    } catch (error) {
      console.error('Error searching FAQ:', error);
      return [];
    }
  };

  // Smart suggestions (enhanced from CustomerServiceScreen)
  const getSmartSuggestions = (text: string) => {
    if (!text || text.length < 2) return [];
    
    const keywords = {
      'billing': ['payment', 'charge', 'bill', 'invoice', 'refund', 'money', 'cost', 'price'],
      'technical': ['app', 'login', 'error', 'bug', 'crash', 'slow', 'loading', 'connection'],
      'service': ['repair', 'maintenance', 'oil', 'brake', 'tire', 'engine', 'service', 'fix'],
      'scheduling': ['appointment', 'book', 'schedule', 'time', 'date', 'cancel', 'reschedule'],
      'account': ['profile', 'password', 'email', 'phone', 'update', 'change', 'account'],
      'vehicle': ['car', 'truck', 'vehicle', 'vin', 'year', 'make', 'model', 'mileage'],
    };

    const suggestions: any[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(keywords).forEach(([category, words]) => {
      const matchingWords = words.filter(word => lowerText.includes(word));
      if (matchingWords.length > 0) {
        const issue = issueCategories.find(i => i.id === category);
        if (issue) {
          suggestions.push({
            ...issue,
            confidence: matchingWords.length / words.length,
            matchedWords: matchingWords,
          });
        }
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  };

  const categorizeCustomIssue = (text: string) => {
    const suggestions = getSmartSuggestions(text);
    if (suggestions.length > 0 && suggestions[0].confidence > 0.3) {
      return suggestions[0];
    }
    return null;
  };

  const handleCustomIssueChange = (text: string) => {
    setCustomIssue(text);
    
    if (text.length > 2) {
      const newSuggestions = getSmartSuggestions(text);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      
      const category = categorizeCustomIssue(text);
      setAutoCategory(category);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setAutoCategory(null);
    }
  };

  const handleSuggestionSelect = async (suggestion: any) => {
    await hapticService.selection();
    setSelectedIssue(suggestion.id);
    setCustomIssue('');
    setShowSuggestions(false);
    setAutoCategory(null);
  };

  const handleIssueSelect = async (issueId: string) => {
    await hapticService.selection();
    setSelectedIssue(issueId);
    setCustomIssue('');
    setShowSuggestions(false);
    setAutoCategory(null);
  };

  const handlePrioritySelect = async (priorityId: string) => {
    await hapticService.selection();
    setPriority(priorityId);
  };

  const handleRequestSupport = async () => {
    if (!selectedIssue && !customIssue.trim()) {
      Alert.alert('Select Issue', 'Please select an issue type or describe your problem.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please log in to create a support request.');
      return;
    }

    setIsRequesting(true);
    await hapticService.buttonPress();

    try {
      const issue = selectedIssue || 'custom';
      const issueDescription = selectedIssue ? 
        issueCategories.find(i => i.id === selectedIssue)?.label : 
        customIssue.trim();

      // Create support ticket using context
      const newTicket = await createTicket({
        userId: user.id,
        title: issueDescription,
        description: customIssue.trim() || issueDescription,
        category: issue,
        priority: priority as any,
        status: 'open',
      });
      
      Alert.alert(
        'Support Request Submitted',
        'Your support request has been submitted. You will be connected with an agent shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setActiveTab('tickets');
              // Clear form
              setSelectedIssue('');
              setCustomIssue('');
              setPriority('normal');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error requesting support:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLiveChat = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to start a chat session.');
      return;
    }

    await hapticService.buttonPress();
    
    try {
      const session = await startChatSession(user.id);
      setActiveTab('chat');
      setChatMessages(session.messages);
    } catch (error) {
      console.error('Error starting chat session:', error);
      Alert.alert('Error', 'Failed to start chat session. Please try again.');
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !activeChatSession) return;

    try {
      const newMessage = await sendChatMessage(activeChatSession.id, {
        ticketId: activeChatSession.id,
        senderId: user?.id || 'user',
        senderType: 'user',
        content: chatInput.trim(),
      });

      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
    } catch (error) {
      console.error('Error sending chat message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return theme.info;
      case 'in_progress': return theme.warning;
      case 'resolved': return theme.success;
      case 'closed': return theme.textSecondary;
      default: return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return 'help-outline';
      case 'in_progress': return 'hourglass-empty';
      case 'resolved': return 'check-circle';
      case 'closed': return 'cancel';
      default: return 'help-outline';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Render methods
  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: theme.surface }]}>
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            backgroundColor: theme.primary,
            transform: [{ translateX: tabIndicatorAnim }],
          },
        ]}
      />
      {[
        { key: 'help', label: 'Help Center', icon: 'help-outline' },
        { key: 'tickets', label: 'My Tickets', icon: 'support-agent' },
        { key: 'chat', label: 'Live Chat', icon: 'chat' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => {
            setActiveTab(tab.key as any);
            hapticService.selection();
          }}
        >
          <IconFallback
            name={tab.icon}
            size={20}
            color={activeTab === tab.key ? theme.primary : theme.textSecondary}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color: activeTab === tab.key ? theme.primary : theme.textSecondary,
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearchBar = () => (
    <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
      <IconFallback name="search" size={20} color={theme.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder="Search help articles..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <IconFallback name="close" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFAQCategory = (categoryKey: string, category: any) => {
    const filteredItems = searchQuery
      ? category.items.filter((item: any) =>
          `${item.question} ${item.answer}`.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : category.items;

    if (filteredItems.length === 0) return null;

    return (
      <View key={categoryKey} style={styles.faqCategory}>
        <View style={styles.faqCategoryHeader}>
          <IconFallback name={category.icon} size={24} color={theme.primary} />
          <Text style={[styles.faqCategoryTitle, { color: theme.text }]}>
            {category.title}
          </Text>
        </View>
        {filteredItems.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.faqItem, { backgroundColor: theme.surface }]}
            onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.faqQuestion, { color: theme.text }]}>
                {item.question}
              </Text>
              <IconFallback
                name={expandedFAQ === item.id ? 'expand-less' : 'expand-more'}
                size={24}
                color={theme.textSecondary}
              />
            </View>
            {expandedFAQ === item.id && (
              <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                {item.answer}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderHelpCenter = () => (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContentContainer}
    >
      {renderSearchBar()}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.surface }]}
            onPress={handleLiveChat}
          >
            <IconFallback name="chat" size={24} color={theme.primary} />
            <Text style={[styles.quickActionTitle, { color: theme.text }]}>
              Live Chat
            </Text>
            <Text style={[styles.quickActionSubtitle, { color: theme.textSecondary }]}>
              Chat with support
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.surface }]}
            onPress={() => {
              Alert.alert(
                'Contact Support',
                'Choose how you\'d like to contact us',
                [
                  { text: 'Email', onPress: () => Linking.openURL('mailto:support@queued.app') },
                  { text: 'Phone', onPress: () => Linking.openURL('tel:+1800QUEUED1') },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <IconFallback name="support-agent" size={24} color={theme.primary} />
            <Text style={[styles.quickActionTitle, { color: theme.text }]}>
              Contact Support
            </Text>
            <Text style={[styles.quickActionSubtitle, { color: theme.textSecondary }]}>
              Email or phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.surface }]}
            onPress={() => setActiveTab('tickets')}
          >
            <IconFallback name="support-agent" size={24} color={theme.primary} />
            <Text style={[styles.quickActionTitle, { color: theme.text }]}>
              My Tickets
            </Text>
            <Text style={[styles.quickActionSubtitle, { color: theme.textSecondary }]}>
              View requests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: theme.surface }]}
            onPress={() => Alert.alert('Bug Report', 'Bug reporting feature coming soon!')}
          >
            <IconFallback name="bug-report" size={24} color={theme.primary} />
            <Text style={[styles.quickActionTitle, { color: theme.text }]}>
              Report Bug
            </Text>
            <Text style={[styles.quickActionSubtitle, { color: theme.textSecondary }]}>
              Technical issues
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Frequently Asked Questions
        </Text>
        
        {Object.entries(faqCategories).map(([key, category]) =>
          renderFAQCategory(key, category)
        )}
      </View>

      {/* Create Support Request */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Still need help?
        </Text>
        
        <MaterialButton
          title="Create Support Request"
          onPress={() => {
            setSelectedIssue('');
            setCustomIssue('');
            setPriority('normal');
            // Scroll to request form or show modal
          }}
          variant="outlined"
          style={styles.createRequestButton}
        />
      </View>
    </ScrollView>
  );

  const renderSupportTickets = () => (
    <ScrollView
      style={styles.tabContent}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.tabContentContainer}
    >
      {isLoadingTickets ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading your support tickets...
          </Text>
        </View>
      ) : supportTickets.length === 0 ? (
        <View style={styles.emptyState}>
          <IconFallback name="support-agent" size={64} color={theme.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
            No support tickets yet
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: theme.textSecondary }]}>
            When you create a support request, it will appear here
          </Text>
          <MaterialButton
            title="Create First Ticket"
            onPress={() => setActiveTab('help')}
            style={styles.emptyStateButton}
          />
        </View>
      ) : (
        <>
          <View style={styles.ticketsHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Support Tickets
            </Text>
            <Text style={[styles.ticketsCount, { color: theme.textSecondary }]}>
              {supportTickets.length} ticket{supportTickets.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {supportTickets.map((ticket) => (
            <MaterialCard
              key={ticket.id}
              style={[styles.ticketCard, { backgroundColor: theme.surface }]}
            >
              <View style={styles.ticketHeader}>
                <View style={styles.ticketInfo}>
                  <Text style={[styles.ticketTitle, { color: theme.text }]}>
                    {ticket.title}
                  </Text>
                  <Text style={[styles.ticketDescription, { color: theme.textSecondary }]}>
                    {ticket.description}
                  </Text>
                </View>
                <View style={styles.ticketStatus}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) + '20' },
                    ]}
                  >
                    <IconFallback
                      name={getStatusIcon(ticket.status)}
                      size={16}
                      color={getStatusColor(ticket.status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(ticket.status) },
                      ]}
                    >
                      {ticket.status.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.ticketFooter}>
                <View style={styles.ticketMeta}>
                  <Text style={[styles.ticketDate, { color: theme.textSecondary }]}>
                    Created {formatDate(ticket.createdAt)}
                  </Text>
                  <Text style={[styles.ticketPriority, { color: theme.textSecondary }]}>
                    {priorityLevels.find(p => p.id === ticket.priority)?.label}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.viewTicketButton, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    // Navigate to ticket details
                    Alert.alert('Ticket Details', 'Ticket details view coming soon!');
                  }}
                >
                  <Text style={[styles.viewTicketText, { color: theme.onPrimary }]}>
                    View
                  </Text>
                </TouchableOpacity>
              </View>
            </MaterialCard>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderLiveChat = () => (
    <View style={styles.tabContent}>
      {!isChatConnected ? (
        <View style={styles.chatWelcome}>
          <IconFallback name="chat" size={64} color={theme.primary} />
          <Text style={[styles.chatWelcomeTitle, { color: theme.text }]}>
            Start a Live Chat
          </Text>
          <Text style={[styles.chatWelcomeSubtitle, { color: theme.textSecondary }]}>
            Get instant help from our support team
          </Text>
          <MaterialButton
            title="Start Chat"
            onPress={handleLiveChat}
            style={styles.startChatButton}
          />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.chatMessage,
                  message.senderType === 'user'
                    ? styles.userMessage
                    : styles.agentMessage,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    {
                      backgroundColor:
                        message.senderType === 'user' ? theme.primary : theme.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color:
                          message.senderType === 'user' ? theme.onPrimary : theme.text,
                      },
                    ]}
                  >
                    {message.content}
                  </Text>
                  <Text
                    style={[
                      styles.messageTime,
                      {
                        color:
                          message.senderType === 'user'
                            ? theme.onPrimary + '80'
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.chatInputContainer, { backgroundColor: theme.surface }]}>
            <TextInput
              style={[styles.chatInput, { color: theme.text }]}
              placeholder="Type your message..."
              placeholderTextColor={theme.textSecondary}
              value={chatInput}
              onChangeText={setChatInput}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: chatInput.trim() ? theme.primary : theme.divider,
                },
              ]}
              onPress={handleSendChatMessage}
              disabled={!chatInput.trim()}
            >
              <IconFallback
                name="send"
                size={20}
                color={chatInput.trim() ? theme.onPrimary : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Support Center"
        subtitle="Get help and support"
        onBackPress={() => navigation.goBack()}
        showBack
      />
      
      {renderTabBar()}
      
      {activeTab === 'help' && renderHelpCenter()}
      {activeTab === 'tickets' && renderSupportTickets()}
      {activeTab === 'chat' && renderLiveChat()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '33.33%',
    borderRadius: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  faqCategory: {
    marginBottom: 24,
  },
  faqCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  faqCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  faqItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  createRequestButton: {
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 32,
  },
  ticketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ticketsCount: {
    fontSize: 14,
  },
  ticketCard: {
    padding: 16,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  ticketStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketMeta: {
    flex: 1,
  },
  ticketDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  ticketPriority: {
    fontSize: 12,
  },
  viewTicketButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewTicketText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chatWelcome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  chatWelcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  chatWelcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  startChatButton: {
    paddingHorizontal: 32,
  },
  chatMessages: {
    flex: 1,
    padding: 20,
  },
  chatMessagesContainer: {
    paddingBottom: 20,
  },
  chatMessage: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  agentMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
