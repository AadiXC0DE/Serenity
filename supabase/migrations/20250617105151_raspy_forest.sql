/*
  # Fix user registration database error

  1. Database Schema Fixes
    - Remove incorrect foreign key constraint on user_profiles.id
    - Add proper trigger function to handle new user creation
    - Add trigger to automatically create user profiles

  2. Security
    - Maintain existing RLS policies
    - Ensure proper user profile creation flow

  3. Changes
    - Drop existing foreign key constraint that references non-existent users table
    - Create handle_new_user trigger function
    - Create trigger on auth.users to automatically create profiles
*/

-- Drop the incorrect foreign key constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_id_fkey' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_id_fkey;
  END IF;
END $$;

-- Create or replace the handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, name, preferences)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    '{"voiceSpeed": 1.0, "empathyLevel": 0.8, "voiceEnabled": true, "fullVoiceMode": false, "preferredTechniques": ["CBT", "Mindfulness"]}'::jsonb
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the update_last_accessed function exists
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;