-- Fix UUID Type Casting Issues
-- This script fixes the "operator does not exist: uuid = text" error
-- Run this if you already have tables but need to fix the RLS policies

-- Drop existing policies that have type mismatches
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view own support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update own support tickets" ON support_tickets;

DROP POLICY IF EXISTS "Users can view messages for their tickets" ON support_messages;
DROP POLICY IF EXISTS "Users can create messages for their tickets" ON support_messages;

DROP POLICY IF EXISTS "Users can view jobs they're involved in" ON jobs;
DROP POLICY IF EXISTS "Customers can create jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update jobs they're involved in" ON jobs;

DROP POLICY IF EXISTS "Users can view bids for jobs they're involved in" ON bids;
DROP POLICY IF EXISTS "Mechanics can create bids" ON bids;

DROP POLICY IF EXISTS "Users can view own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can create vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

DROP POLICY IF EXISTS "Users can view conversations they're involved in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;

-- Recreate policies with proper UUID casting
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::uuid = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::uuid = id);

-- Support tickets policies
CREATE POLICY "Users can view own support tickets" ON support_tickets
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create support tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own support tickets" ON support_tickets
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Support messages policies
CREATE POLICY "Users can view messages for their tickets" ON support_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Users can create messages for their tickets" ON support_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets 
      WHERE support_tickets.id = support_messages.ticket_id 
      AND support_tickets.user_id = auth.uid()::uuid
    )
  );

-- Jobs policies
CREATE POLICY "Users can view jobs they're involved in" ON jobs
  FOR SELECT USING (auth.uid()::uuid = customer_id OR auth.uid()::uuid = mechanic_id);

CREATE POLICY "Customers can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid()::uuid = customer_id);

CREATE POLICY "Users can update jobs they're involved in" ON jobs
  FOR UPDATE USING (auth.uid()::uuid = customer_id OR auth.uid()::uuid = mechanic_id);

-- Bids policies
CREATE POLICY "Users can view bids for jobs they're involved in" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = bids.job_id 
      AND (jobs.customer_id = auth.uid()::uuid OR jobs.mechanic_id = auth.uid()::uuid)
    )
  );

CREATE POLICY "Mechanics can create bids" ON bids
  FOR INSERT WITH CHECK (auth.uid()::uuid = mechanic_id);

-- Vehicles policies
CREATE POLICY "Users can view own vehicles" ON vehicles
  FOR SELECT USING (auth.uid()::uuid = customer_id);

CREATE POLICY "Users can create vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid()::uuid = customer_id);

CREATE POLICY "Users can update own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid()::uuid = customer_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Conversations policies
CREATE POLICY "Users can view conversations they're involved in" ON conversations
  FOR SELECT USING (auth.uid()::uuid = customer_id OR auth.uid()::uuid = mechanic_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::uuid = customer_id OR auth.uid()::uuid = mechanic_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.customer_id = auth.uid()::uuid OR conversations.mechanic_id = auth.uid()::uuid)
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.customer_id = auth.uid()::uuid OR conversations.mechanic_id = auth.uid()::uuid)
    )
  );
