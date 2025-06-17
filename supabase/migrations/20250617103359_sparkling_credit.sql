/*
  # Create vector search function for memories

  1. Functions
    - `match_memories` - Vector similarity search function
    
  2. Purpose
    - Enable semantic search of user memories using vector embeddings
    - Return memories similar to a query embedding
*/

-- Create the match_memories function for vector similarity search
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  input_user_id uuid  -- Renamed parameter to avoid conflict
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  embedding vector(384),
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
  WHERE user_memories.user_id = input_user_id  -- Updated to use the renamed parameter
    AND user_memories.embedding IS NOT NULL
    AND 1 - (user_memories.embedding <=> query_embedding) > match_threshold
  ORDER BY user_memories.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;