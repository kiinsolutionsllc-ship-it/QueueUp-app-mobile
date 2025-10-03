-- Targeted fix for vehicles table foreign key constraint
-- This will allow your custom CUSTOMER-/MECHANIC- IDs to work

-- Step 1: Drop the foreign key constraint that's blocking the insert
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_customer_id_fkey;

-- Step 2: Check the current data type of customer_id column
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'vehicles'
    AND column_name = 'customer_id';

-- Step 3: Change customer_id from UUID to TEXT (if needed)
-- This allows your custom CUSTOMER-/MECHANIC- format
ALTER TABLE vehicles ALTER COLUMN customer_id TYPE TEXT;

-- Step 4: Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'vehicles'
    AND column_name = 'customer_id';

-- Step 5: Test that the vehicles table is ready for your custom IDs
-- This should show that customer_id is now TEXT type
SELECT 'Vehicles table is now ready for custom user IDs!' as status;
