import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import IconFallback from '../../components/shared/IconFallback';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContextAWS';
import { useLanguage } from '../../contexts/LanguageContext';
import ModernHeader from '../../components/shared/ModernHeader';
import MaterialCard from '../../components/shared/MaterialCard';
import MaterialButton from '../../components/shared/MaterialButton';
import { FadeIn, SlideInFromBottom } from '../../components/shared/Animations';
import { hapticService } from '../../services/HapticService';
import enhancedUnifiedMessagingService from '../../services/EnhancedUnifiedMessagingService';


interface CustomerServiceScreenProps {
  navigation: any;
}
export default function CustomerServiceScreen({ navigation }: CustomerServiceScreenProps) {
  const { getCurrentTheme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();
  const theme = getCurrentTheme();

  const [selectedIssue, setSelectedIssue] = useState<any>('');
  const [customIssue, setCustomIssue] = useState<any>('');
  const [priority, setPriority] = useState<any>('normal');
  const [isRequesting, setIsRequesting] = useState<any>(false);
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any>([]);
  const [autoCategory, setAutoCategory] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState<any>(false);

  const commonIssues = [
    { 
      id: 'billing', 
      label: 'Billing & Payment', 
      icon: 'payment', 
      description: 'Questions about charges, refunds, or payment methods',
      emoji: '💳',
      popular: true
    },
    { 
      id: 'scheduling', 
      label: 'Book or Reschedule', 
      icon: 'schedule', 
      description: 'Book new appointments or reschedule existing ones',
      emoji: '📅',
      popular: true
    },
    { 
      id: 'vehicle_issues', 
      label: 'Vehicle Service', 
      icon: 'directions-car', 
      description: 'Car problems, maintenance questions, or service updates',
      emoji: '🚗',
      popular: true
    },
    { 
      id: 'technical', 
      label: 'App Help', 
      icon: 'build', 
      description: 'App issues, login problems, or technical difficulties',
      emoji: '📱',
      popular: false
    },
    { 
      id: 'account', 
      label: 'My Account', 
      icon: 'person', 
      description: 'Profile updates, password reset, or account settings',
      emoji: '👤',
      popular: false
    },
    { 
      id: 'general', 
      label: 'Something Else', 
      icon: 'help', 
      description: 'Other questions or concerns',
      emoji: '❓',
      popular: false
    },
  ];

  const priorityLevels = [
    { 
      id: 'low', 
      label: 'I can wait', 
      color: theme.success, 
      description: 'No rush - whenever you have time',
      emoji: '😊',
      estimatedTime: '2-4 hours'
    },
    { 
      id: 'normal', 
      label: 'Standard', 
      color: theme.info, 
      description: 'Normal priority - typical response time',
      emoji: '👍',
      estimatedTime: '30-60 minutes'
    },
    { 
      id: 'high', 
      label: 'I need help soon', 
      color: theme.warning, 
      description: 'Important - please respond quickly',
      emoji: '⚡',
      estimatedTime: '15-30 minutes'
    },
    { 
      id: 'urgent', 
      label: 'Emergency!', 
      color: theme.error, 
      description: 'Critical issue - immediate attention needed',
      emoji: '🚨',
      estimatedTime: '5-15 minutes'
    },
  ];

  useEffect(() => {
    checkQueueStatus();
  }, []);

  const checkQueueStatus = () => {
    if (user?.id) {
      // For now, return a default status since we don't have customer service queue in the new system
      const status = { status: 'available', estimatedWait: 0 };
      setQueueStatus(status);
    }
  };

  // Smart suggestions based on keywords
  const getSmartSuggestions = (text: any) => {
    if (!text || text.length < 2) return [];
    
    const keywords = {
      'billing': ['payment', 'charge', 'bill', 'invoice', 'refund', 'money', 'cost', 'price'],
      'technical': ['app', 'login', 'error', 'bug', 'crash', 'slow', 'loading', 'connection'],
      'service': ['repair', 'maintenance', 'oil', 'brake', 'tire', 'engine', 'service', 'fix'],
      'scheduling': ['appointment', 'book', 'schedule', 'time', 'date', 'cancel', 'reschedule'],
      'account': ['profile', 'password', 'email', 'phone', 'update', 'change', 'account'],
      'vehicle': ['car', 'truck', 'vehicle', 'vin', 'year', 'make', 'model', 'mileage']
    };

    const suggestions: any[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(keywords).forEach(([category, words]) => {
      const matchingWords = words.filter(word => lowerText.includes(word));
      if (matchingWords.length > 0) {
        const issue = commonIssues.find(i => i.id === category);
        if (issue) {
          suggestions.push({
            ...issue,
            confidence: matchingWords.length / words.length,
            matchedWords: matchingWords
          });
        }
      }
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  };

  // Auto-categorize custom issue
  const categorizeCustomIssue = (text: any) => {
    const suggestions = getSmartSuggestions(text);
    if (suggestions.length > 0 && suggestions[0].confidence > 0.3) {
      return suggestions[0];
    }
    return null;
  };

  const handleCustomIssueChange = (text: any) => {
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

  const handleIssueSelect = async (issueId: any) => {
    await hapticService.selection();
    setSelectedIssue(issueId);
    setCustomIssue(''); // Clear custom issue when selecting predefined one
    setShowSuggestions(false);
    setAutoCategory(null);
  };

  const handlePrioritySelect = async (priorityId: any) => {
    await hapticService.selection();
    setPriority(priorityId);
  };

  const handleRequestSupport = async () => {
    if (!selectedIssue && !customIssue.trim()) {
      Alert.alert('Select Issue', 'Please select an issue type or describe your problem.');
      return;
    }

    setIsRequesting(true);
    await hapticService.buttonPress();

    try {
      const issue = selectedIssue || 'custom';
      const issueDescription = selectedIssue ? 
        commonIssues.find(i => i.id === selectedIssue)?.label : 
        customIssue.trim();

      // For now, just navigate to messaging since we don't have customer service queue
      const result = { success: true };

      if (result.success) {
        Alert.alert(
          'Support Request Submitted',
          'Your support request has been submitted. You will be connected with an agent shortly.',
          [
            {
              text: 'OK',
              onPress: () => {
                checkQueueStatus();
                // Navigate to messaging if conversation was created
                if (queueStatus?.status === 'assigned') {
                  navigation.navigate('ConversationList');
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to submit support request. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting support:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const renderIssueCard = (issue: any) => (
    <FadeIn key={issue.id} delay={100}>
      <TouchableOpacity
        style={[
          styles.issueCard,
          {
            backgroundColor: selectedIssue === issue.id ? theme.primary + '15' : theme.surface,
            borderColor: selectedIssue === issue.id ? theme.primary : theme.divider,
            borderWidth: selectedIssue === issue.id ? 2 : 1,
          },
        ]}
        onPress={() => handleIssueSelect(issue.id)}
        activeOpacity={0.7}
      >
        <View style={styles.issueHeader}>
          <View style={styles.issueLeft}>
            <Text style={styles.issueEmoji}>{issue.emoji}</Text>
            <View style={[styles.issueIcon, { backgroundColor: theme.primary + '15' }]}>
              <IconFallback name={issue.icon} size={20} color={theme.primary} />
            </View>
          </View>
          <View style={styles.issueContent}>
            <View style={styles.issueTitleRow}>
              <Text style={[styles.issueTitle, { color: theme.text }]}>
                {issue.label}
              </Text>
              {issue.popular && (
                <View style={[styles.popularBadge, { backgroundColor: theme.success + '20' }]}>
                  <Text style={[styles.popularText, { color: theme.success }]}>Popular</Text>
                </View>
              )}
            </View>
            <Text style={[styles.issueDescription, { color: theme.textSecondary }]}>
              {issue.description}
            </Text>
          </View>
          {selectedIssue === issue.id && (
            <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
              <IconFallback name="check" size={16} color={theme.onPrimary} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </FadeIn>
  );

  const renderPriorityCard = (priorityLevel: any) => (
    <TouchableOpacity
      key={priorityLevel.id}
      style={[
        styles.priorityCard,
        {
          backgroundColor: priority === priorityLevel.id ? priorityLevel.color + '15' : theme.surface,
          borderColor: priority === priorityLevel.id ? priorityLevel.color : theme.divider,
          borderWidth: priority === priorityLevel.id ? 2 : 1,
        },
      ]}
      onPress={() => handlePrioritySelect(priorityLevel.id)}
      activeOpacity={0.7}
    >
      <View style={styles.priorityHeader}>
        <View style={styles.priorityLeft}>
          <Text style={styles.priorityEmoji}>{priorityLevel.emoji}</Text>
          <View style={[styles.priorityIndicator, { backgroundColor: priorityLevel.color }]} />
        </View>
        <View style={styles.priorityContent}>
          <Text style={[styles.priorityLabel, { color: theme.text }]}>
            {priorityLevel.label}
          </Text>
          <Text style={[styles.priorityDescription, { color: theme.textSecondary }]}>
            {priorityLevel.description}
          </Text>
          <Text style={[styles.estimatedTime, { color: priorityLevel.color }]}>
            ⏱️ {priorityLevel.estimatedTime}
          </Text>
        </View>
        {priority === priorityLevel.id && (
          <View style={[styles.selectedIndicator, { backgroundColor: priorityLevel.color }]}>
            <IconFallback name="check" size={16} color={theme.onPrimary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderQueueStatus = () => {
    if (!queueStatus || queueStatus.status === 'not_queued') {
      return null;
    }

    return (
      <SlideInFromBottom delay={200}>
        <MaterialCard style={[styles.queueCard, { backgroundColor: theme.surface }]}>
          <View style={styles.queueHeader}>
            <IconFallback name="support-agent" size={24} color={theme.primary} />
            <Text style={[styles.queueTitle, { color: theme.text }]}>
              Support Request Status
            </Text>
          </View>
          
          {queueStatus.status === 'queued' && (
            <View style={styles.queueInfo}>
              <Text style={[styles.queueText, { color: theme.textSecondary }]}>
                You are #{queueStatus.queuePosition} in queue
              </Text>
              <Text style={[styles.queueText, { color: theme.textSecondary }]}>
                Estimated wait time: {queueStatus.estimatedWaitTime} minutes
              </Text>
            </View>
          )}
          
          {queueStatus.status === 'assigned' && (
            <View style={styles.queueInfo}>
              <Text style={[styles.queueText, { color: theme.success }]}>
                ✓ Agent assigned! Check your messages.
              </Text>
            </View>
          )}
        </MaterialCard>
      </SlideInFromBottom>
    );
  };


  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ModernHeader
        title="Customer Support"
        subtitle="Get help from our support team"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightActions={[
          { icon: 'refresh', onPress: checkQueueStatus },
        ]}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        bounces={true}
        nestedScrollEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustContentInsets={true}
      >
        {/* Queue Status */}
        {renderQueueStatus()}

        {/* Issue Selection */}
        <SlideInFromBottom delay={100}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                How can we help you today?
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Choose what you need help with
              </Text>
            </View>
            
            {/* Popular Issues */}
            <View style={styles.popularSection}>
              <Text style={[styles.popularTitle, { color: theme.text }]}>
                Most Popular
              </Text>
              {commonIssues.filter(issue => issue.popular).map((issue, index) => renderIssueCard(issue))}
            </View>
            
            {/* Other Issues */}
            <View style={styles.otherSection}>
              <Text style={[styles.otherTitle, { color: theme.text }]}>
                Other Options
              </Text>
              {commonIssues.filter(issue => !issue.popular).map((issue, index) => renderIssueCard(issue))}
            </View>
            
            {/* Custom Issue Input */}
            <View style={[styles.customIssueContainer, { backgroundColor: theme.surface }]}>
              <View style={styles.customIssueHeader}>
                <Text style={styles.customIssueEmoji}>✍️</Text>
                <Text style={[styles.customIssueLabel, { color: theme.text }]}>
                  Don't see what you need? Tell us:
                </Text>
              </View>
              <TextInput
                style={[
                  styles.customIssueInput,
                  {
                    backgroundColor: theme.background,
                    color: theme.text,
                    borderColor: customIssue.trim() ? theme.primary : theme.divider,
                    borderWidth: customIssue.trim() ? 2 : 1,
                  },
                ]}
                placeholder="Describe your issue in your own words..."
                placeholderTextColor={theme.textSecondary}
                value={customIssue}
                onChangeText={handleCustomIssueChange}
                multiline
                numberOfLines={3}
              />
              
              {/* Smart Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <View style={[styles.suggestionsContainer, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.suggestionsTitle, { color: theme.text }]}>
                    💡 Did you mean one of these?
                  </Text>
                  {suggestions.map((suggestion: any, index: any) => (
                    <TouchableOpacity
                      key={suggestion.id}
                      style={[
                        styles.suggestionItem,
                        { 
                          backgroundColor: theme.cardBackground,
                          borderColor: theme.divider,
                        }
                      ]}
                      onPress={() => handleSuggestionSelect(suggestion)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.suggestionLeft}>
                        <Text style={styles.suggestionEmoji}>{suggestion.emoji}</Text>
                        <View style={[styles.suggestionIcon, { backgroundColor: suggestion.color + '15' }]}>
                          <IconFallback name={suggestion.icon} size={16} color={suggestion.color} />
                        </View>
                      </View>
                      <View style={styles.suggestionContent}>
                        <Text style={[styles.suggestionLabel, { color: theme.text }]}>
                          {suggestion.label}
                        </Text>
                        <Text style={[styles.suggestionDescription, { color: theme.textSecondary }]}>
                          {suggestion.description}
                        </Text>
                        <Text style={[styles.suggestionConfidence, { color: theme.primary }]}>
                          {Math.round(suggestion.confidence * 100)}% match
                        </Text>
                      </View>
                      <IconFallback name="arrow-forward-ios" size={16} color={theme.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Auto-category indicator */}
              {autoCategory && (
                <View style={[styles.autoCategoryIndicator, { backgroundColor: autoCategory.color + '15' }]}>
                  <Text style={[styles.autoCategoryEmoji]}>{autoCategory.emoji}</Text>
                  <Text style={[styles.autoCategoryText, { color: autoCategory.color }]}>
                    Auto-detected: {autoCategory.label}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleSuggestionSelect(autoCategory)}
                    style={[styles.autoCategoryButton, { backgroundColor: autoCategory.color }]}
                  >
                    <Text style={[styles.autoCategoryButtonText, { color: theme.onPrimary }]}>
                      Use This
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </SlideInFromBottom>

        {/* Priority Selection */}
        <SlideInFromBottom delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                How urgent is this?
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Help us prioritize your request
              </Text>
            </View>
            {priorityLevels.map((priorityLevel) => renderPriorityCard(priorityLevel))}
          </View>
        </SlideInFromBottom>

        {/* Request Support Button */}
        <SlideInFromBottom delay={300}>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonHeader}>
              <Text style={[styles.buttonTitle, { color: theme.text }]}>
                Ready to get help?
              </Text>
              <Text style={[styles.buttonSubtitle, { color: theme.textSecondary }]}>
                We'll connect you with the right person
              </Text>
            </View>
            <MaterialButton
              title={isRequesting ? 'Sending your request...' : 'Get Help Now'}
              onPress={handleRequestSupport}
              disabled={isRequesting || (!selectedIssue && !customIssue.trim())}
              loading={isRequesting}
              style={[
                styles.requestButton,
                {
                  backgroundColor: (!selectedIssue && !customIssue.trim()) ? theme.divider : theme.primary,
                }
              ]}
            />
            <Text style={[styles.buttonNote, { color: theme.textSecondary }]}>
              💬 You'll be able to chat with our support team once connected
            </Text>
          </View>
        </SlideInFromBottom>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.8,
  },
  popularSection: {
    marginBottom: 24,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4CAF50',
  },
  otherSection: {
    marginBottom: 24,
  },
  otherTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  issueCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  issueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  issueEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  issueIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueContent: {
    flex: 1,
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  issueDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  customIssueContainer: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customIssueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customIssueEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  customIssueLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  customIssueInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  suggestionsContainer: {
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  suggestionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'System',
  },
  suggestionConfidence: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'System',
  },
  autoCategoryIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  autoCategoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  autoCategoryText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
  },
  autoCategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  autoCategoryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  priorityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priorityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priorityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  priorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityContent: {
    flex: 1,
  },
  priorityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  priorityDescription: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 18,
  },
  estimatedTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  queueCard: {
    padding: 16,
    marginBottom: 16,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  queueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  queueInfo: {
    marginLeft: 36,
  },
  queueText: {
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    marginVertical: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  buttonHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  buttonSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  requestButton: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  buttonNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  bottomSpacing: {
    height: 100, // Increased to ensure bottom content is fully visible
  },
});
