// Export all type definitions with specific exports to avoid conflicts
export * from './ComponentTypes';

// Export specific types from ThemeTypes to avoid conflicts
export type {
  Theme as ThemeType,
  ThemeContextType as ThemeContextTypeDef
} from './ThemeTypes';

// Export specific types from UserTypes to avoid conflicts
export type {
  User as UserType,
  Mechanic as MechanicType,
  Vehicle as VehicleType,
  Customer,
  WorkingHours,
  ServiceRecord,
  AuthState,
  SignInData
} from './UserTypes';

// Export specific types from JobDetailsTypes to avoid conflicts
export type {
  Job,
  JobStatus,
  JobUrgency,
  ServiceType,
  JobDetailsModalProps,
  JobAction,
  StatusConfig,
  JobDetailsTheme,
  JobDetailsStyles,
  UseJobDetailsReturn,
  JobTimelineEvent,
  ImageGalleryItem,
  JobNote,
  JobRating,
  JobDetailsError,
  LoadingState,
  JobDetailsEvents
} from './JobDetailsTypes';

// Export specific types from JobTypes to avoid conflicts
export type {
  JobFormData,
  StepState,
  StepNavigation,
  ValidationResult,
  ValidationRule,
  ModalState,
  PaymentData,
  PaymentResult,
  ImageData,
  ImageUploadResult,
  CardAnimationState,
  ServiceCategory,
  ServiceSubcategory,
  UseStepManagementReturn,
  UseFormValidationReturn,
  UseModalManagementReturn,
  UsePaymentProcessingReturn,
  UseImageManagementReturn,
  UseAutoSaveReturn,
  UseNetworkStatusReturn,
  NavigationProps,
  StepComponentProps,
  ModalComponentProps,
  PaymentModalProps,
  AppError,
  ErrorBoundaryState,
  PerformanceMetrics,
  TestProps
} from './JobTypes';

// Export specific types from MessagingTypes to avoid conflicts
export type {
  Message,
  Conversation,
  MessageType,
  MessageStatus,
  ConversationType,
  UseMessagingReturn,
  UnifiedMessagingScreenProps,
  MessageBubbleProps,
  ConversationModalProps,
  MessagingStyles,
  MessagingState,
  MessagingError,
  MessagingEvents,
  User,
  UserStatus,
  MessagingNavigationProp,
  MessagingRouteProp,
  MessagingRouteParams,
  MessageMetadata,
  MessageReaction,
  ConversationMetadata,
  AttachmentMenuProps,
  QuickRepliesProps,
  MessageOptionsProps,
  ReactionPickerProps,
  Theme as MessagingTheme,
  AnimationConfig,
  PermissionStatus,
  QuickReply,
  ConversationFilter,
  MessageSearchResult,
  MessagingNotification
} from './MessagingTypes';

// Additional missing type definitions
export interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightActions?: any[];
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  showProfile?: boolean;
  onProfilePress?: () => void;
  user?: any;
  showStatusBar?: boolean;
  showBackButton?: boolean;
  [key: string]: any;
}

export interface MaterialTextInputProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  keyboardType?: string;
  autoCapitalize?: string;
  style?: any;
  inputStyle?: any;
  success?: boolean;
  loading?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  type?: string;
  onPress?: () => void;
  min?: number;
  max?: number;
  step?: number;
  [key: string]: any;
}

export interface ValidatedFormProps {
  initialValues?: Record<string, any>;
  validationRules?: Record<string, any>;
  onSubmit: (values: any) => void;
  submitButtonText?: string;
  submitButtonVariant?: string;
  submitButtonSize?: string;
  children: (props: {
    MaterialTextInput: any;
    values: any;
    errors: any;
    touched: any;
  }) => any;
  showValidationErrors?: boolean;
  style?: any;
  [key: string]: any;
}

export interface MaterialButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: string;
  size?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: string | any;
  iconPosition?: string;
  fullWidth?: boolean;
  style?: any;
  textStyle?: any;
  children?: any;
  hapticFeedback?: boolean;
  hapticType?: string;
  [key: string]: any;
}

export interface CalendarWidgetProps {
  selectedDate?: any;
  selectedDates?: any[];
  onDateSelect?: (date: any) => void;
  onDateRangeSelect?: (dates: any) => void;
  showDateRange?: boolean;
  minDate?: any;
  maxDate?: any;
  style?: any;
  isDateAvailable?: (date: any) => boolean;
  [key: string]: any;
}

export interface CardProps {
  children: any;
  style?: any;
  padding?: string;
  shadow?: string;
  onPress?: () => void;
  disabled?: boolean;
  haptic?: boolean;
  [key: string]: any;
}

export interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
  onPress?: () => void;
  [key: string]: any;
}

// Extended User interface with missing properties
export interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  user_type: 'customer' | 'mechanic';
  userType?: 'customer' | 'mechanic'; // Alias for compatibility
  role: 'customer' | 'mechanic';
  created_at: string;
  updated_at: string;
  profile_completed?: boolean;
  subscription_tier?: 'free' | 'professional' | 'enterprise';
  stripe_customer_id?: string;
  is_verified?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  bio?: string;
  specialties?: string[];
  experience?: number;
  certifications?: any[];
  // Mechanic-specific properties
  hourlyRate?: number;
  shopName?: string;
  licenseNumber?: string;
  insuranceProvider?: string;
  emergencyContact?: string;
  [key: string]: any;
}

// Extended Job interface with missing properties
export interface ExtendedJob {
  id: string;
  customer_id: string;
  mechanic_id?: string;
  vehicle_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimated_duration?: number;
  estimatedDuration?: number; // Alias for compatibility
  scheduled_date?: string;
  scheduledDate?: string; // Alias for compatibility
  scheduledDateTime?: string; // Alias for compatibility
  created_at: string;
  updated_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancelledAt?: string; // Alias for compatibility
  work_started_at?: string;
  workStartedAt?: string; // Alias for compatibility
  confirmed_by?: string;
  confirmedBy?: string; // Alias for compatibility
  mechanic_response?: string;
  mechanicResponse?: string; // Alias for compatibility
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos?: string[];
  estimated_cost?: number;
  final_cost?: number;
  payment_status?: string;
  rating?: number;
  review?: string;
  [key: string]: any;
}

// Context types
export interface AuthContextType {
  user: ExtendedUser | null;
  userType: 'customer' | 'mechanic' | null;
  loading: boolean;
  onboardingCompleted: boolean;
  signIn: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: any) => Promise<void>;
  [key: string]: any;
}

export interface PaymentContextType {
  payments: any[];
  loading: boolean;
  loadPayments: () => Promise<void>;
  getMechanicEarnings: () => Promise<any>;
  getMechanicEarningsSummary: () => Promise<any>;
  [key: string]: any;
}

export interface AccessibilityContextType {
  settings: any;
  toggleTTS: () => void;
  toggleVoiceRecognition: () => void;
  updateTTSRate: (rate: number) => void;
  updateTTSPitch: (pitch: number) => void;
  updateTTSLanguage: (language: string) => void;
  updateVoiceLanguage: (language: string) => void;
  updateSettings: (settings: any) => void;
  speak: (text: string) => void;
  [key: string]: any;
}

export interface ReviewContextType {
  createReview: (data: any) => Promise<void>;
  [key: string]: any;
}

// Theme extensions
export interface ExtendedTheme {
  primary: string;
  primaryVariant: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryVariant: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  cardBackground: string;
  navigationBackground: string;
  text: string;
  textSecondary: string;
  textLight: string;
  textDisabled: string;
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  completed: string;
  pending: string;
  cancelled: string;
  inProgress: string;
  scheduled: string;
  onPrimary: string;
  onSecondary: string;
  onBackground: string;
  onSurface: string;
  onError: string;
  onSuccess: string;
  onWarning: string;
  onInfo: string;
  divider: string;
  border: string;
  borderLight: string;
  borderDark: string;
  orange: string;
  orangeLight: string;
  orangeDark: string;
  cardShadow: string;
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  avatarBackground: string;
  progressGreen: string;
  progressRed: string;
  progressYellow: string;
  progressBlue: string;
  statusBarStyle?: 'default' | 'light-content' | 'dark-content'; // Additional property
  [key: string]: any;
}

// Animation types
export interface AnimationStyle {
  animation?: any;
  [key: string]: any;
}

// Expo AV types
export interface ExpoAVTypes {
  Recording: any;
  RecordingOptionsPresets: any;
  Sound: any;
  setAudioModeAsync: (mode: any) => Promise<void>;
  [key: string]: any;
}

// Utility types
export interface StatusUtils {
  getStatusHistory: (status: string) => any[];
  [key: string]: any;
}

// Navigation types - using NavigationProps from JobTypes.ts

// Screen props
export interface ScreenProps {
  navigation: any;
  route: any;
  [key: string]: any;
}

// Mechanic screen props
export interface MechanicProfileScreenProps {
  navigation: any;
  route: any;
  [key: string]: any;
}

// Generic component props
export interface ComponentProps {
  [key: string]: any;
}

// Style types
export interface StyleSheet {
  [key: string]: any;
}

// Any type for flexibility
export type AnyType = any;
