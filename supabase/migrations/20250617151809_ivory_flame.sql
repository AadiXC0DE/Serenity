/*
  # Add credits system to user profiles

  1. Changes
    - Add credits column to user_profiles table
    - Add credits_used_today column for daily tracking
    - Add last_credit_reset column for daily reset tracking
    - Add indexes for efficient querying
    - Update default preferences to include credit settings

  2. Security
    - Maintain existing RLS policies
    - Add proper constraints for credits

  3. Functions
    - Add function to reset daily credits
    - Add function to check and deduct credits
*/

-- Add credits columns to user_profiles
DO $$
BEGIN
  -- Add credits column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'credits'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN credits integer DEFAULT 100 CHECK (credits >= 0);
  END IF;

  -- Add credits_used_today column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'credits_used_today'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN credits_used_today integer DEFAULT 0 CHECK (credits_used_today >= 0);
  END IF;

  -- Add last_credit_reset column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'last_credit_reset'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_credit_reset date DEFAULT CURRENT_DATE;
  END IF;

  -- Add unlimited_credits column for special accounts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'unlimited_credits'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN unlimited_credits boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for efficient credit queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_credits ON user_profiles(credits);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_reset ON user_profiles(last_credit_reset);

-- Function to reset daily credits if needed
CREATE OR REPLACE FUNCTION reset_daily_credits_if_needed(user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    credits_used_today = 0,
    last_credit_reset = CURRENT_DATE
  WHERE 
    id = user_id 
    AND last_credit_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and deduct credits
CREATE OR REPLACE FUNCTION use_credits(
  user_id uuid,
  credit_cost integer,
  operation_type text DEFAULT 'general'
)
RETURNS jsonb AS $$
DECLARE
  user_record record;
  result jsonb;
BEGIN
  -- Reset daily credits if needed
  PERFORM reset_daily_credits_if_needed(user_id);
  
  -- Get current user data
  SELECT credits, credits_used_today, unlimited_credits 
  INTO user_record
  FROM user_profiles 
  WHERE id = user_id;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found',
      'credits_remaining', 0
    );
  END IF;
  
  -- Check if user has unlimited credits
  IF user_record.unlimited_credits THEN
    RETURN jsonb_build_object(
      'success', true,
      'credits_remaining', 999999,
      'unlimited', true
    );
  END IF;
  
  -- Check if user has enough credits
  IF user_record.credits < credit_cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'credits_remaining', user_record.credits,
      'credits_needed', credit_cost
    );
  END IF;
  
  -- Deduct credits
  UPDATE user_profiles 
  SET 
    credits = credits - credit_cost,
    credits_used_today = credits_used_today + credit_cost
  WHERE id = user_id;
  
  -- Return success with remaining credits
  SELECT credits INTO user_record.credits 
  FROM user_profiles 
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'credits_remaining', user_record.credits,
    'credits_used', credit_cost
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user credits info
CREATE OR REPLACE FUNCTION get_user_credits(user_id uuid)
RETURNS jsonb AS $$
DECLARE
  user_record record;
BEGIN
  -- Reset daily credits if needed
  PERFORM reset_daily_credits_if_needed(user_id);
  
  -- Get current user data
  SELECT credits, credits_used_today, unlimited_credits 
  INTO user_record
  FROM user_profiles 
  WHERE id = user_id;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'error', 'User not found'
    );
  END IF;
  
  RETURN jsonb_build_object(
    'credits', user_record.credits,
    'credits_used_today', user_record.credits_used_today,
    'unlimited_credits', user_record.unlimited_credits
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users to have credits
UPDATE user_profiles 
SET 
  credits = 100,
  credits_used_today = 0,
  last_credit_reset = CURRENT_DATE
WHERE credits IS NULL;

-- Update the handle_new_user function to include credits
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, preferences, credits, credits_used_today, last_credit_reset)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    '{"voiceSpeed": 1.0, "empathyLevel": 0.8, "voiceEnabled": true, "fullVoiceMode": false, "preferredTechniques": ["CBT", "Mindfulness"], "userBio": "", "responseLength": 0.6, "conversationStyle": "Casual Friend"}'::jsonb,
    100, -- Starting credits
    0,   -- Credits used today
    CURRENT_DATE -- Last reset date
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;