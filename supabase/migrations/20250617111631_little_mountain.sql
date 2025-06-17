/*
  # Update embedding dimensions from 384 to 768

  1. Changes
    - Clear existing embedding data (incompatible dimensions)
    - Update embedding column to use vector(768)
    - Recreate vector search index for 768 dimensions
    - Update match_memories function for 768 dimensions

  2. Note
    - This will clear existing embeddings as they cannot be converted
    - New embeddings will be generated with 768 dimensions
*/

-- First, clear existing embedding data (incompatible dimensions)
UPDATE user_memories SET embedding = NULL WHERE embedding IS NOT NULL;

-- Drop the existing vector index
DROP INDEX IF EXISTS idx_user_memories_embedding;

-- Update the embedding column to use 768 dimensions
ALTER TABLE user_memories ALTER COLUMN embedding TYPE vector(768);

-- Recreate the vector similarity search index with 768 dimensions
CREATE INDEX idx_user_memories_embedding ON user_memories 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update the match_memories function to use 768 dimensions
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  input_user_id uuid
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  embedding vector(768),
  importance float,
  tags text[],
  created_at timestamptz,
  last_accessed timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    user_memories.id,
    user_memories.user_id,
    user_memories.content,
    user_memories.embedding,
    user_memories.importance,
    user_memories.tags,
    user_memories.created_at,
    user_memories.last_accessed,
    1 - (user_memories.embedding <=> query_embedding) AS similarity
  FROM user_memories
  WHERE user_memories.user_id = input_user_id
    AND user_memories.embedding IS NOT NULL
    AND 1 - (user_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY user_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;