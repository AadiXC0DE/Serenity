/*
  # Create memories table for AI therapy companion

  1. New Tables
    - `user_memories`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `content` (text)
      - `embedding` (vector for semantic search)
      - `importance` (float)
      - `tags` (text array)
      - `created_at` (timestamp)
      - `last_accessed` (timestamp)

  2. Security
    - Enable RLS on `user_memories` table
    - Add policies for users to manage their own memories

  3. Indexes
    - Add indexes for efficient querying
*/

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user memories table
CREATE TABLE IF NOT EXISTS user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  embedding vector(384), -- 384-dimensional embeddings
  importance float DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own memories"
  ON user_memories
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own memories"
  ON user_memories
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memories"
  ON user_memories
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own memories"
  ON user_memories
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_memories_user_id ON user_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memories_created_at ON user_memories(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_memories_importance ON user_memories(user_id, importance DESC);
CREATE INDEX IF NOT EXISTS idx_user_memories_tags ON user_memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_memories_last_accessed ON user_memories(user_id, last_accessed DESC);

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_user_memories_embedding ON user_memories 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create trigger for last_accessed update
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS trigger AS $$
BEGIN
  NEW.last_accessed = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memories_last_accessed
  BEFORE UPDATE ON user_memories
  FOR EACH ROW EXECUTE FUNCTION update_last_accessed();