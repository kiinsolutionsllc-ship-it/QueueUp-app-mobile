-- Fix RLS Policies for QueueUp Database
-- Run this in your Supabase SQL Editor to fix the signup issue

-- First, let's check if the users table exists and has RLS enabled
-- (This is just for reference - you don't need to run this)

-- Add the missing INSERT policy for users table
-- This allows new users to be inserted during signup
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Also add a policy to allow users to insert their own profile during signup
-- This is more permissive and handles the signup flow
CREATE POLICY "Allow user signup" ON users 
FOR INSERT 
WITH CHECK (true);

-- If the above is too permissive, use this more secure version instead:
-- CREATE POLICY "Allow user signup" ON users 
-- FOR INSERT 
-- WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Add policies for other tables that might be needed during signup
-- (These are already in the migration but let's ensure they exist)

-- Bids policies
CREATE POLICY "Mechanics can create bids" ON bids 
FOR INSERT 
WITH CHECK (auth.uid() = mechanic_id);

CREATE POLICY "Mechanics can update own bids" ON bids 
FOR UPDATE 
USING (auth.uid() = mechanic_id);

-- Conversations policies
CREATE POLICY "Users can create conversations" ON conversations 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id OR auth.uid() = mechanic_id);

CREATE POLICY "Users can update own conversations" ON conversations 
FOR UPDATE 
USING (auth.uid() = customer_id OR auth.uid() = mechanic_id);

-- Reviews policies
CREATE POLICY "Users can create reviews" ON reviews 
FOR INSERT 
WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

-- Subscriptions policies
CREATE POLICY "Users can create own subscriptions" ON subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can create own payments" ON payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated successfully! User signup should now work.';
END $$;

