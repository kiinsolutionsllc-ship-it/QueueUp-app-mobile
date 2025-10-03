import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Core job types
export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  urgency: JobUrgency;
  category: string;
  subcategory: string;
  price?: number;
  serviceType: ServiceType;
  scheduledDate?: string;
  scheduledTime?: string;
  scheduledDateTime?: string; // Alias for compatibility
  location?: string;
  vehicle?: Vehicle | string;
  customer?: Customer;
  images?: string[];
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: string | number;
  estimated_duration?: string | number; // Alias for compatibility
  actualDuration?: string;
  notes?: string;
  rating?: number;
  review?: string;
  // Additional properties for compatibility
  cancelledAt?: string;
  cancelled_at?: string;
  workStartedAt?: string;
  work_started_at?: string;
  confirmedBy?: string;
  confirmed_by?: string;
  mechanicResponse?: string;
  mechanic_response?: string;
  // Additional properties accessed in code
  amount?: number; // Alias for price
  [key: string]: any; // For additional properties
}

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type JobUrgency = 'low' | 'medium' | 'high' | 'urgent';
export type ServiceType = 'mobile' | 'shop';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  mileage?: number;
  type?: 'car' | 'truck' | 'motorcycle' | 'other';
  engineType?: 'gas' | 'diesel' | 'electric' | 'hybrid';
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: Address;
  rating?: number;
  totalJobs?: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Component props
export interface JobDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  job: Job | null;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => Promise<void>;
  onAcceptJob?: (jobId: string) => Promise<void>;
  onDeclineJob?: (jobId: string, reason?: string) => Promise<void>;
  onRescheduleJob?: (jobId: string, newDate: string, newTime: string) => Promise<void>;
  onCallCustomer?: (phoneNumber: string) => void;
  onNavigateToLocation?: (address: Address) => void;
  onShareJob?: (job: Job) => void;
  onAddNote?: (jobId: string, note: string) => Promise<void>;
  onRateJob?: (jobId: string, rating: number, review?: string) => Promise<void>;
  showActions?: boolean;
  userRole?: 'customer' | 'mechanic' | 'admin';
  style?: ViewStyle;
  testID?: string;
}

// Action button types
export interface JobAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

// Status configuration
export interface StatusConfig {
  color: string;
  backgroundColor: string;
  icon: string;
  label: string;
  description: string;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
  delay?: number;
}

// Theme types (extending existing theme)
export interface JobDetailsTheme {
  primary: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  cardBackground: string;
  cardShadow: string;
  border: string;
  accent: string;
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
}

// Style types
export interface JobDetailsStyles {
  container: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  closeButton: ViewStyle;
  content: ViewStyle;
  contentContainer: ViewStyle;
  jobTitle: TextStyle;
  jobDescription: TextStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  section: ViewStyle;
  sectionTitle: TextStyle;
  infoRow: ViewStyle;
  infoLabel: TextStyle;
  infoValue: TextStyle;
  actionsContainer: ViewStyle;
  actionButton: ViewStyle;
  actionButtonText: TextStyle;
  imageContainer: ViewStyle;
  vehicleImage: ImageStyle;
  placeholderImage: ViewStyle;
  timelineContainer: ViewStyle;
  timelineItem: ViewStyle;
  timelineDot: ViewStyle;
  timelineLine: ViewStyle;
  timelineContent: ViewStyle;
  timelineDate: TextStyle;
  timelineTitle: TextStyle;
  timelineDescription: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
}

// Hook return types
export interface UseJobDetailsReturn {
  job: Job | null;
  loading: LoadingState;
  error: string | null;
  actions: JobAction[];
  statusConfig: StatusConfig;
  formatJobTitle: (title: string) => string;
  formatJobType: (type: string) => string;
  formatVehicle: (vehicle: Vehicle | string) => string;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatPrice: (price: number) => string;
  getStatusColor: (status: JobStatus) => string;
  getUrgencyColor: (urgency: JobUrgency) => string;
  handleStatusChange: (newStatus: JobStatus) => Promise<void>;
  handleAcceptJob: () => Promise<void>;
  handleDeclineJob: (reason?: string) => Promise<void>;
  handleRescheduleJob: (newDate: string, newTime: string) => Promise<void>;
  handleCallCustomer: () => void;
  handleNavigateToLocation: () => void;
  handleShareJob: () => void;
  handleAddNote: (note: string) => Promise<void>;
  handleRateJob: (rating: number, review?: string) => Promise<void>;
  refreshJob: () => Promise<void>;
}

// Timeline types
export interface JobTimelineEvent {
  id: string;
  type: 'created' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'note' | 'status_change';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
}

// Image gallery types
export interface ImageGalleryItem {
  id: string;
  uri: string;
  caption?: string;
  uploadedAt: string;
  uploadedBy: string;
}

// Note types
export interface JobNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  isPrivate: boolean;
}

// Rating types
export interface JobRating {
  id: string;
  rating: number;
  review?: string;
  createdAt: string;
  ratedBy: {
    id: string;
    name: string;
    role: string;
  };
  ratedFor: {
    id: string;
    name: string;
    role: string;
  };
}

// Error types
export interface JobDetailsError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// Accessibility types
export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: string;
  accessibilityState?: {
    selected?: boolean;
    disabled?: boolean;
    checked?: boolean;
    expanded?: boolean;
  };
  accessibilityActions?: Array<{
    name: string;
    label: string;
  }>;
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types
export interface JobDetailsEvents {
  onJobStatusChanged: (jobId: string, oldStatus: JobStatus, newStatus: JobStatus) => void;
  onJobAccepted: (jobId: string) => void;
  onJobDeclined: (jobId: string, reason?: string) => void;
  onJobRescheduled: (jobId: string, newDate: string, newTime: string) => void;
  onCustomerCalled: (phoneNumber: string) => void;
  onLocationNavigated: (address: Address) => void;
  onJobShared: (job: Job) => void;
  onNoteAdded: (jobId: string, note: string) => void;
  onJobRated: (jobId: string, rating: number, review?: string) => void;
  onError: (error: JobDetailsError) => void;
}
