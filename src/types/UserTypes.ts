export interface User {
  id: string; // Internal type-specific ID (CUSTOMER- or MECHANIC- prefixed)
  displayId?: string; // User-friendly display ID (e.g., "CUST-001", "MECH-001")
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  user_type: 'customer' | 'mechanic';
  userType?: 'customer' | 'mechanic'; // Alias for compatibility
  role: 'customer' | 'mechanic'; // Alias for user_type for compatibility
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
  homeAddress?: {
    latitude: number;
    longitude: number;
    address: string;
    nickname?: string;
  };
  savedLocations?: SavedLocation[];
  // Additional properties for mechanics
  bio?: string;
  specialties?: string[];
  experience?: number;
  certifications?: Certification[];
  // Mechanic-specific properties
  hourlyRate?: number;
  shopName?: string;
  licenseNumber?: string;
  insuranceProvider?: string;
  emergencyContact?: string;
  // Additional properties accessed in code
  profileImage?: string;
  currentVehicle?: Vehicle;
  createdAt?: string; // Alias for created_at
  [key: string]: any; // For additional properties
}

export interface Customer extends User {
  user_type: 'customer';
  vehicles?: Vehicle[];
  preferences?: CustomerPreferences;
}

export interface Mechanic extends User {
  user_type: 'mechanic';
  profile?: MechanicProfile;
  availability?: Availability;
  working_hours?: WorkingHours[];
  specialties?: string[];
  certifications?: Certification[];
  ratings?: Rating[];
}

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  fuel_type?: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  transmission?: 'manual' | 'automatic';
  engine_size?: string;
  photos?: string[];
  service_history?: ServiceRecord[];
  created_at: string;
  updated_at: string;
}

export interface MechanicProfile {
  id: string;
  mechanic_id: string;
  business_name?: string;
  description?: string;
  experience_years?: number;
  specialties: string[];
  service_areas: string[];
  hourly_rate?: number;
  minimum_job_value?: number;
  maximum_job_value?: number;
  availability_radius?: number;
  languages?: string[];
  certifications?: Certification[];
  insurance_info?: InsuranceInfo;
  business_hours?: BusinessHours[];
  photos?: string[];
  rating?: number;
  total_reviews?: number;
  completed_jobs?: number;
  response_time?: number;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  verification_url?: string;
}

export interface InsuranceInfo {
  provider: string;
  policy_number: string;
  coverage_amount: number;
  expiry_date: string;
  verification_document?: string;
}

export interface BusinessHours {
  day: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface WorkingHours {
  day: string;
  start: string;
  end: string;
  enabled: boolean;
}

export interface Availability {
  status: 'available' | 'busy' | 'offline';
  next_available?: string;
  current_job_id?: string;
  auto_accept_bids?: boolean;
  max_concurrent_jobs?: number;
}

export interface CustomerPreferences {
  preferred_mechanics?: string[];
  preferred_service_times?: string[];
  max_distance?: number;
  price_range?: {
    min: number;
    max: number;
  };
  notification_preferences?: NotificationPreferences;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  job_updates: boolean;
  payment_notifications: boolean;
  promotional_offers: boolean;
}

export interface Rating {
  id: string;
  job_id: string;
  customer_id: string;
  mechanic_id: string;
  rating: number; // 1-5
  comment?: string;
  categories?: {
    quality: number;
    timeliness: number;
    communication: number;
    professionalism: number;
  };
  created_at: string;
}

export interface ServiceRecord {
  id: string;
  vehicle_id: string;
  job_id: string;
  service_type: string;
  description: string;
  cost: number;
  mileage_at_service: number;
  date_performed: string;
  mechanic_name: string;
  parts_used?: string[];
  warranty_info?: string;
  next_service_due?: string;
  photos?: string[];
  receipts?: string[];
}

export interface AuthState {
  user: User | null;
  userType: 'customer' | 'mechanic' | null;
  loading: boolean;
  onboardingCompleted: boolean;
  availabilityStatus: 'available' | 'busy' | 'offline';
  workingHours: WorkingHours[];
}

export interface SignInData {
  email: string;
  password: string;
  userType: 'customer' | 'mechanic';
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: 'customer' | 'mechanic';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface SavedLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  nickname?: string;
  isHome?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  homeAddress?: {
    latitude: number;
    longitude: number;
    address: string;
    nickname?: string;
  };
  savedLocations?: SavedLocation[];
  preferences?: CustomerPreferences;
  profile?: Partial<MechanicProfile>;
}
