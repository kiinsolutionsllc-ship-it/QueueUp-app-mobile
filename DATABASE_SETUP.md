# Database Setup Guide for QueueUp App

## Overview
This guide will help you set up the complete database schema for the QueueUp app in your Supabase project.

## Prerequisites
- ✅ Supabase project created
- ✅ Environment variables configured
- ✅ Supabase credentials in your `.env` file

## Step 1: Access Supabase SQL Editor

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor** (in the left sidebar)
3. **Click "New Query"**

## Step 2: Create Database Schema

1. **Copy the entire contents** of `database_schema.sql` file
2. **Paste it into the SQL Editor**
3. **Click "Run"** to execute the schema

This will create all the required tables:
- ✅ `profiles` - User profiles
- ✅ `support_tickets` - Support ticket system
- ✅ `support_messages` - Support ticket messages
- ✅ `jobs` - Job postings
- ✅ `bids` - Mechanic bids on jobs
- ✅ `vehicles` - Customer vehicles
- ✅ `vehicle_services` - Vehicle service history
- ✅ `vehicle_issues` - Vehicle issues
- ✅ `vehicle_photos` - Vehicle photos
- ✅ `notifications` - User notifications
- ✅ `reviews` - User reviews
- ✅ `payments` - Payment records
- ✅ `bank_accounts` - Bank account information
- ✅ `subscriptions` - User subscriptions
- ✅ `conversations` - Chat conversations
- ✅ `messages` - Chat messages
- ✅ `analytics` - User analytics
- ✅ `settings` - User settings
- ✅ `features` - Feature flags

## Step 3: Verify Tables Created

1. **Go to Table Editor** in your Supabase dashboard
2. **Check that all tables are listed** in the left sidebar
3. **Verify the tables have the correct columns**

## Step 4: Test Database Connection

1. **Restart your development server:**
   ```bash
   npx expo start --clear
   ```

2. **Test the app functionality:**
   - Try to create a support ticket
   - Check if the error is resolved

## Step 5: Row Level Security (RLS)

The schema automatically enables Row Level Security (RLS) on all tables with appropriate policies:

- **Users can only access their own data**
- **Customers can only see their own jobs, vehicles, etc.**
- **Mechanics can only see jobs they're involved in**
- **Support tickets are private to the user who created them**

## Step 6: Database Functions and Triggers

The schema includes:
- **Automatic `updated_at` timestamps** - Updates automatically when records are modified
- **UUID generation** - Automatic ID generation for new records
- **Data validation** - Check constraints ensure data integrity

## Troubleshooting

### Common Issues

#### 1. "Table does not exist" errors
- **Solution**: Make sure you ran the complete `database_schema.sql` file
- **Check**: Go to Table Editor to verify tables exist

#### 2. "Permission denied" errors
- **Solution**: RLS policies are working correctly - users can only access their own data
- **Check**: Make sure you're authenticated when testing

#### 3. "Function does not exist" errors
- **Solution**: The schema includes all necessary functions
- **Check**: Make sure you ran the complete schema file

### Debug Steps

1. **Check Supabase logs:**
   - Go to Logs in your Supabase dashboard
   - Look for any database errors

2. **Verify table structure:**
   - Go to Table Editor
   - Check that tables have the expected columns

3. **Test with simple queries:**
   ```sql
   SELECT * FROM profiles LIMIT 1;
   SELECT * FROM support_tickets LIMIT 1;
   ```

## Database Schema Details

### Key Tables

#### `profiles`
- Stores user profile information
- Links to `auth.users` via UUID
- Includes user type (customer/mechanic)

#### `support_tickets`
- Support ticket system
- Links to user who created the ticket
- Includes status, priority, category

#### `jobs`
- Job postings by customers
- Links to customer and assigned mechanic
- Includes location, status, costs

#### `bids`
- Mechanic bids on jobs
- Links to job and mechanic
- Includes amount, description, status

#### `vehicles`
- Customer vehicle information
- Links to customer
- Includes make, model, year, VIN

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User-specific data access** - users can only see their own data
- **Proper foreign key relationships** with cascade deletes
- **Data validation** with check constraints

### Performance Features

- **Indexes** on frequently queried columns
- **Automatic timestamps** with triggers
- **Efficient data types** (UUID, JSONB, etc.)

## Next Steps

After setting up the database:

1. **Test the app functionality**
2. **Create some sample data** (optional)
3. **Monitor database performance**
4. **Set up database backups** (recommended)

## Support

If you encounter issues:
1. Check the Supabase dashboard logs
2. Verify your environment variables
3. Test with simple SQL queries
4. Contact Supabase support if needed

## Cost Information

Supabase free tier includes:
- **500MB database storage**
- **2GB bandwidth**
- **50,000 monthly active users**

The database schema is optimized for the free tier and should handle thousands of users without issues.
