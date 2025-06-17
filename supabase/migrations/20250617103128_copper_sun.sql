/*
  # Create conversations table for chat history

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `session_id` (text)
      - `messages` (jsonb array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `conversations` table
    - Add policies for users to manage their own conversations

  3. Indexes
    - Add indexes for efficient querying
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(user_id, updated_at DESC);

-- Create unique constraint for user_id + session_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_user_session 
ON conversations(user_id, session_id);

-- Create trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();