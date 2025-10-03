-- QueueUp App Database Schema for Supabase
-- This file contains all the required tables for the QueueUp application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- USER PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  user_type TEXT CHECK (user_type IN ('customer', 'mechanic')) NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  name TEXT,
  location JSONB,
  bio TEXT,
  specialties TEXT[],
  experience INTEGER DEFAULT 0,
  certifications JSONB DEFAULT '[]',
  mechanic_type TEXT CHECK (mechanic_type IN ('mobile', 'shop')),
  profile_completed BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'professional', 'enterprise')) DEFAULT 'free',
  stripe_customer_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SUPPORT TICKETS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  agent_id UUID REFERENCES auth.users(id),
  attachments TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SUPPORT MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  sender_type TEXT CHECK (sender_type IN ('user', 'agent')) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
  attachments TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- JOBS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  mechanic_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  vehicle_id UUID,
  location JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- BIDS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  mechanic_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  estimated_duration INTEGER, -- in minutes
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- VEHICLES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT,
  license_plate TEXT,
  color TEXT,
  mileage INTEGER,
  fuel_type TEXT,
  transmission TEXT,
  engine_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- VEHICLE SERVICES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS vehicle_services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(10,2),
  mileage_at_service INTEGER,
  service_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_service_due TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- VEHICLE ISSUES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS vehicle_issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('reported', 'diagnosed', 'fixed', 'ignored')) DEFAULT 'reported',
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fixed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- VEHICLE PHOTOS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS vehicle_photos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('exterior', 'interior', 'damage', 'service', 'other')) DEFAULT 'other',
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('job', 'bid', 'payment', 'system', 'support')) NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- REVIEWS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
  reviewee_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PAYMENTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) NOT NULL,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  mechanic_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- BANK ACCOUNTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  account_holder_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  routing_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('checking', 'savings')) DEFAULT 'checking',
  is_verified BOOLEAN DEFAULT FALSE,
  stripe_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SUBSCRIPTIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid')) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CONVERSATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) NOT NULL,
  mechanic_id UUID REFERENCES auth.users(id) NOT NULL,
  job_id UUID REFERENCES jobs(id),
  status TEXT CHECK (status IN ('active', 'archived', 'blocked')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
  attachments TEXT[] DEFAULT '{}',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ANALYTICS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- SETTINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, setting_key)
);

-- ========================================
-- FEATURES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PROFILES POLICIES
-- ========================================
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::uuid = id);

-- ========================================
-- SUPPORT TICKETS POLICIES
-- ========================================
CREATE POLICY "Users can view own support tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own support tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- SUPPORT MESSAGES POLICIES
-- ========================================
CREATE POLICY "Users can view messages for their tickets" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their tickets" ON support_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()
    )
  );

-- ========================================
-- JOBS POLICIES
-- ========================================
CREATE POLICY "Users can view jobs they're involved in" ON jobs
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Customers can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update jobs they're involved in" ON jobs
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

-- ========================================
-- BIDS POLICIES
-- ========================================
CREATE POLICY "Users can view bids for jobs they're involved in" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = bids.job_id 
      AND (jobs.customer_id = auth.uid() OR jobs.mechanic_id = auth.uid())
    )
  );

CREATE POLICY "Mechanics can create bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = mechanic_id);

CREATE POLICY "Users can update their own bids" ON bids
  FOR UPDATE USING (auth.uid() = mechanic_id);

-- ========================================
-- VEHICLES POLICIES
-- ========================================
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Users can create vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid() = customer_id);

-- ========================================
-- VEHICLE SERVICES POLICIES
-- ========================================
CREATE POLICY "Users can view services for their vehicles" ON vehicle_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = vehicle_services.vehicle_id 
      AND vehicles.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create services for their vehicles" ON vehicle_services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = vehicle_services.vehicle_id 
      AND vehicles.customer_id = auth.uid()
    )
  );

-- ========================================
-- VEHICLE ISSUES POLICIES
-- ========================================
CREATE POLICY "Users can view issues for their vehicles" ON vehicle_issues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = vehicle_issues.vehicle_id 
      AND vehicles.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create issues for their vehicles" ON vehicle_issues
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = vehicle_issues.vehicle_id 
      AND vehicles.customer_id = auth.uid()
    )
  );

-- ========================================
-- VEHICLE PHOTOS POLICIES
-- ========================================
CREATE POLICY "Users can view photos for their vehicles" ON vehicle_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = vehicle_photos.vehicle_id 
      AND vehicles.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create photos for their vehicles" ON vehicle_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM vehicles 
      WHERE vehicles.id = vehicle_photos.vehicle_id 
      AND vehicles.customer_id = auth.uid()
    )
  );

-- ========================================
-- NOTIFICATIONS POLICIES
-- ========================================
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- REVIEWS POLICIES
-- ========================================
CREATE POLICY "Users can view reviews for jobs they're involved in" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = reviews.job_id 
      AND (jobs.customer_id = auth.uid() OR jobs.mechanic_id = auth.uid())
    )
  );

CREATE POLICY "Users can create reviews for jobs they're involved in" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = reviews.job_id 
      AND (jobs.customer_id = auth.uid() OR jobs.mechanic_id = auth.uid())
    )
  );

-- ========================================
-- PAYMENTS POLICIES
-- ========================================
CREATE POLICY "Users can view payments for jobs they're involved in" ON payments
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- ========================================
-- BANK ACCOUNTS POLICIES
-- ========================================
CREATE POLICY "Users can view own bank accounts" ON bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bank accounts" ON bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts" ON bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- SUBSCRIPTIONS POLICIES
-- ========================================
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- CONVERSATIONS POLICIES
-- ========================================
CREATE POLICY "Users can view conversations they're involved in" ON conversations
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = customer_id OR auth.uid() = mechanic_id);

-- ========================================
-- MESSAGES POLICIES
-- ========================================
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.customer_id = auth.uid() OR conversations.mechanic_id = auth.uid())
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.customer_id = auth.uid() OR conversations.mechanic_id = auth.uid())
    )
  );

-- ========================================
-- ANALYTICS POLICIES
-- ========================================
CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- SETTINGS POLICIES
-- ========================================
CREATE POLICY "Users can view own settings" ON settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create settings" ON settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON settings
  FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- FEATURES POLICIES
-- ========================================
CREATE POLICY "Everyone can view features" ON features
  FOR SELECT USING (true);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Support tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Support messages indexes
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_timestamp ON support_messages(timestamp);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_mechanic_id ON jobs(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Bids indexes
CREATE INDEX IF NOT EXISTS idx_bids_job_id ON bids(job_id);
CREATE INDEX IF NOT EXISTS idx_bids_mechanic_id ON bids(mechanic_id);

-- Vehicles indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ========================================
-- FUNCTIONS AND TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA (Optional)
-- ========================================

-- Insert some default features
INSERT INTO features (name, description, is_enabled) VALUES
('job_posting', 'Allow customers to post jobs', true),
('bid_system', 'Allow mechanics to bid on jobs', true),
('payment_processing', 'Process payments for completed jobs', true),
('messaging', 'Enable messaging between customers and mechanics', true),
('reviews', 'Allow users to review each other', true),
('notifications', 'Send notifications for important events', true),
('support_tickets', 'Enable support ticket system', true),
('analytics', 'Track user analytics and metrics', true)
ON CONFLICT (name) DO NOTHING;
