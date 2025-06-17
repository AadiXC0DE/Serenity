import { UserMemory, Message } from '../types';
import { geminiService } from './geminiService';
import { supabase } from './supabaseClient';

class MemoryService {
  async saveMemory(userId: string, content: string, importance: number = 0.5): Promise<void> {
    try {
      // Only save memories that are actually important to avoid clutter
      if (importance < 0.4) {
        console.log('Skipping low-importance memory');
        return;
      }

      // Generate embedding using Gemini
      const embedding = await geminiService.generateEmbedding(content);
      const tags = this.extractTags(content);
      
      const { error } = await supabase
        .from('user_memories')
        .insert({
          user_id: userId,
          content,
          embedding,
          importance,
          tags
        });

      if (error) {
        console.error('❌ Error saving memory:', error);
        throw error;
      }

      console.log(`✅ Memory saved (importance: ${importance.toFixed(2)}):`, content.substring(0, 50));
    } catch (error) {
      console.error('❌ Error saving memory:', error);
    }
  }

  async deleteMemory(memoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_memories')
        .delete()
        .eq('id', memoryId);

      if (error) {
        console.error('❌ Error deleting memory:', error);
        throw error;
      }

      console.log('✅ Memory deleted:', memoryId);
    } catch (error) {
      console.error('❌ Error deleting memory:', error);
      throw error;
    }
  }

  async getComprehensiveContext(userId: string, currentMessage: string): Promise<UserMemory[]> {
    try {
      // Only get memories if the current message is substantial and likely to benefit from context
      if (currentMessage.length < 20 || this.isGenericMessage(currentMessage)) {
        console.log('Skipping memory retrieval for generic/short message');
        return [];
      }

      // Get different types of memories but with stricter relevance filtering
      const [recentMemories, importantMemories, similarMemories] = await Promise.all([
        this.getRecentMemories(userId, 2), // Reduced from 3
        this.getImportantMemories(userId, 2), // Reduced from 3
        this.searchMemories(userId, currentMessage, 3) // Keep semantic search
      ]);

      // Combine all memories and remove duplicates
      const allMemories = [
        ...recentMemories,
        ...importantMemories,
        ...similarMemories
      ];

      const uniqueMemories = allMemories.filter((memory, index, self) => 
        index === self.findIndex(m => m.id === memory.id)
      );

      // Filter out memories that are too old or not contextually relevant
      const filteredMemories = uniqueMemories.filter(memory => {
        // Don't use memories older than 30 days unless they're very important
        const daysSinceCreated = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCreated > 30 && memory.importance < 0.8) {
          return false;
        }

        // Check if memory is contextually relevant to current message
        return this.isMemoryRelevant(memory, currentMessage);
      });

      // Sort by relevance: importance + recency + similarity
      const sortedMemories = filteredMemories.sort((a, b) => {
        const aScore = a.importance * 0.6 + this.getRecencyScore(a) * 0.4;
        const bScore = b.importance * 0.6 + this.getRecencyScore(b) * 0.4;
        return bScore - aScore;
      });

      // Return top 4 most relevant memories (reduced from 8)
      const contextMemories = sortedMemories.slice(0, 4);
      
      console.log(`✅ Retrieved ${contextMemories.length} contextual memories for: "${currentMessage.substring(0, 30)}..."`);
      return contextMemories;
        
    } catch (error) {
      console.error('❌ Error getting comprehensive context:', error);
      return [];
    }
  }

  private isGenericMessage(message: string): boolean {
    const genericPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)$/i,
      /^(ok|okay|yes|no|thanks|thank you|bye|goodbye)$/i,
      /^(how are you|what's up|what's new)$/i,
      /^(it's better now|better now|good|fine|alright)$/i
    ];

    return genericPatterns.some(pattern => pattern.test(message.trim()));
  }

  private isMemoryRelevant(memory: UserMemory, currentMessage: string): boolean {
    const memoryLower = memory.content.toLowerCase();
    const messageLower = currentMessage.toLowerCase();

    // Check for direct keyword overlap
    const memoryWords = memoryLower.split(/\s+/).filter(word => word.length > 3);
    const messageWords = messageLower.split(/\s+/).filter(word => word.length > 3);
    
    const commonWords = memoryWords.filter(word => messageWords.includes(word));
    const relevanceScore = commonWords.length / Math.max(memoryWords.length, messageWords.length);

    // Memory is relevant if:
    // 1. High importance (always relevant)
    // 2. Has significant word overlap
    // 3. Shares emotional context
    return memory.importance > 0.8 || 
           relevanceScore > 0.2 || 
           this.hasSharedEmotionalContext(memory, currentMessage);
  }

  private hasSharedEmotionalContext(memory: UserMemory, currentMessage: string): boolean {
    const emotionalKeywords = [
      'anxious', 'anxiety', 'worried', 'stress', 'stressed',
      'sad', 'depressed', 'happy', 'excited', 'angry',
      'frustrated', 'overwhelmed', 'calm', 'peaceful'
    ];

    const memoryEmotions = emotionalKeywords.filter(emotion => 
      memory.content.toLowerCase().includes(emotion)
    );
    const messageEmotions = emotionalKeywords.filter(emotion => 
      currentMessage.toLowerCase().includes(emotion)
    );

    return memoryEmotions.some(emotion => messageEmotions.includes(emotion));
  }

  private getRecencyScore(memory: UserMemory): number {
    const daysSinceCreated = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 1 - (daysSinceCreated / 30)); // Decay over 30 days
  }

  async searchMemories(userId: string, query: string, limit: number = 5): Promise<UserMemory[]> {
    try {
      // Only do semantic search for substantial queries
      if (query.length < 20) {
        return [];
      }

      const queryEmbedding = await geminiService.generateEmbedding(query);
      
      const { data, error } = await supabase.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5, // Increased threshold for better relevance
        match_count: limit,
        input_user_id: userId
      });

      if (error) {
        console.error('❌ Vector search error:', error);
        return [];
      }

      const memories: UserMemory[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        embedding: row.embedding,
        importance: row.importance,
        tags: row.tags,
        createdAt: new Date(row.created_at),
        lastAccessed: new Date(row.last_accessed)
      }));

      console.log(`✅ Vector search found ${memories.length} similar memories`);
      return memories;
    } catch (error) {
      console.error('❌ Error searching memories:', error);
      return [];
    }
  }

  async getRecentMemories(userId: string, limit: number = 3): Promise<UserMemory[]> {
    try {
      const { data, error } = await supabase
        .from('user_memories')
        .select('*')
        .eq('user_id', userId)
        .gte('importance', 0.5) // Only get moderately important recent memories
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting recent memories:', error);
        return [];
      }

      const memories: UserMemory[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        embedding: row.embedding || [],
        importance: row.importance,
        tags: row.tags,
        createdAt: new Date(row.created_at),
        lastAccessed: new Date(row.last_accessed)
      }));

      console.log(`✅ Retrieved ${memories.length} recent memories`);
      return memories;
    } catch (error) {
      console.error('❌ Error getting recent memories:', error);
      return [];
    }
  }

  // Updated to show more memories in settings - lowered threshold
  async getImportantMemories(userId: string, limit: number = 20): Promise<UserMemory[]> {
    try {
      console.log(`🔍 Fetching important memories for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_memories')
        .select('*')
        .eq('user_id', userId)
        .gte('importance', 0.4) // Lowered from 0.8 to 0.4 to show more memories
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting important memories:', error);
        return [];
      }

      console.log(`📊 Raw data from database:`, data?.length || 0, 'memories found');

      const memories: UserMemory[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        embedding: row.embedding || [],
        importance: row.importance,
        tags: row.tags,
        createdAt: new Date(row.created_at),
        lastAccessed: new Date(row.last_accessed)
      }));

      console.log(`✅ Retrieved ${memories.length} important memories for settings`);
      console.log(`📋 Memory importance scores:`, memories.map(m => m.importance));
      
      return memories;
    } catch (error) {
      console.error('❌ Error getting important memories:', error);
      return [];
    }
  }

  // New method specifically for settings that shows ALL memories
  async getAllMemoriesForSettings(userId: string): Promise<UserMemory[]> {
    try {
      console.log(`🔍 Fetching ALL memories for settings for user: ${userId}`);
      
      const { data, error } = await supabase
        .from('user_memories')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Show up to 50 memories

      if (error) {
        console.error('❌ Error getting all memories:', error);
        return [];
      }

      console.log(`📊 Found ${data?.length || 0} total memories in database`);

      const memories: UserMemory[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        embedding: row.embedding || [],
        importance: row.importance,
        tags: row.tags,
        createdAt: new Date(row.created_at),
        lastAccessed: new Date(row.last_accessed)
      }));

      console.log(`✅ Retrieved ${memories.length} memories for settings display`);
      return memories;
    } catch (error) {
      console.error('❌ Error getting all memories:', error);
      return [];
    }
  }

  async getMemoriesByCurrentTags(userId: string, currentMessage: string, limit: number = 2): Promise<UserMemory[]> {
    const tags = this.extractTags(currentMessage);
    if (tags.length === 0) return [];

    return this.getMemoriesByTags(userId, tags, limit);
  }

  async getMemoriesByTags(userId: string, tags: string[], limit: number = 3): Promise<UserMemory[]> {
    try {
      const { data, error } = await supabase
        .from('user_memories')
        .select('*')
        .eq('user_id', userId)
        .overlaps('tags', tags)
        .gte('importance', 0.6) // Only get important tagged memories
        .order('importance', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting memories by tags:', error);
        return [];
      }

      const memories: UserMemory[] = (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        content: row.content,
        embedding: row.embedding || [],
        importance: row.importance,
        tags: row.tags,
        createdAt: new Date(row.created_at),
        lastAccessed: new Date(row.last_accessed)
      }));

      console.log(`✅ Retrieved ${memories.length} memories by tags: ${tags.join(', ')}`);
      return memories;
    } catch (error) {
      console.error('❌ Error getting memories by tags:', error);
      return [];
    }
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();
    
    // Emotional states
    const emotions = [
      'anxiety', 'anxious', 'depression', 'depressed', 'stress', 'stressed',
      'happiness', 'happy', 'anger', 'angry', 'fear', 'scared', 'sadness', 'sad',
      'panic', 'worried', 'excited', 'calm', 'peaceful', 'frustrated', 'overwhelmed'
    ];
    emotions.forEach(emotion => {
      if (lowerContent.includes(emotion)) tags.push(emotion);
    });
    
    // Life areas
    const topics = [
      'work', 'job', 'career', 'family', 'parents', 'relationship', 'partner',
      'health', 'money', 'financial', 'school', 'college', 'friends', 'love',
      'home', 'travel', 'therapy', 'medication', 'sleep', 'exercise'
    ];
    topics.forEach(topic => {
      if (lowerContent.includes(topic)) tags.push(topic);
    });
    
    // People (extract names and relationships)
    const peoplePatterns = [
      /my (\w+) (named|called) (\w+)/gi,
      /(\w+) is my (\w+)/gi,
      /my (\w+) (\w+)/gi
    ];
    
    peoplePatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[3]) {
          tags.push(`person:${match[3].toLowerCase()}`);
          tags.push(`relationship:${match[1].toLowerCase()}`);
        } else if (match[1] && match[2]) {
          tags.push(`person:${match[1].toLowerCase()}`);
          tags.push(`relationship:${match[2].toLowerCase()}`);
        }
      }
    });
    
    return [...new Set(tags)].slice(0, 5); // Limit to 5 tags max
  }

  calculateImportance(message: Message): number {
    let score = 0.3; // Base score
    const content = message.content.toLowerCase();
    
    // Personal information gets high importance
    const personalIndicators = [
      'my name is', 'i am', 'i work', 'my job', 'my family', 'my relationship',
      'my partner', 'my wife', 'my husband', 'my boyfriend', 'my girlfriend',
      'my mom', 'my dad', 'my mother', 'my father', 'my sister', 'my brother',
      'i live', 'my home', 'my address', 'i study', 'my school'
    ];
    personalIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 0.3;
    });
    
    // Emotional content increases importance
    const strongEmotions = [
      'depressed', 'anxious', 'panic', 'suicidal', 'hopeless', 'overwhelmed',
      'excited', 'amazing', 'terrible', 'wonderful', 'devastated', 'thrilled'
    ];
    strongEmotions.forEach(emotion => {
      if (content.includes(emotion)) score += 0.2;
    });
    
    // Specific events and experiences
    const significantEvents = [
      'happened to me', 'i experienced', 'i went through', 'i achieved',
      'i failed', 'i succeeded', 'i learned', 'i realized', 'i discovered',
      'i decided', 'i changed', 'i started', 'i stopped', 'i quit'
    ];
    significantEvents.forEach(event => {
      if (content.includes(event)) score += 0.15;
    });
    
    // Length indicates detail/importance
    if (message.content.length > 50) score += 0.1;
    if (message.content.length > 150) score += 0.1;
    if (message.content.length > 300) score += 0.1;
    
    // Crisis indicators get maximum importance
    const crisisWords = ['suicide', 'kill myself', 'end it all', 'can\'t go on', 'want to die'];
    const hasCrisisContent = crisisWords.some(word => content.includes(word));
    if (hasCrisisContent) score = 1.0;
    
    // Don't save very short or generic messages
    const genericPhrases = ['hi', 'hello', 'hey', 'ok', 'yes', 'no', 'thanks', 'bye', 'better now', 'it\'s better now'];
    if (message.content.length < 15 || genericPhrases.some(phrase => content.trim() === phrase)) {
      score = 0.1; // Very low importance
    }
    
    return Math.min(score, 1.0);
  }

  // Method to get user's memory summary for debugging
  async getMemorySummary(userId: string): Promise<{
    total: number;
    important: number;
    recent: number;
    topTags: string[];
  }> {
    try {
      const { data: allMemories } = await supabase
        .from('user_memories')
        .select('importance, tags, created_at')
        .eq('user_id', userId);

      if (!allMemories) return { total: 0, important: 0, recent: 0, topTags: [] };

      const total = allMemories.length;
      const important = allMemories.filter(m => m.importance >= 0.7).length;
      const recent = allMemories.filter(m => 
        new Date(m.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
      ).length;

      const allTags = allMemories.flatMap(m => m.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topTags = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);

      return { total, important, recent, topTags };
    } catch (error) {
      console.error('❌ Error getting memory summary:', error);
      return { total: 0, important: 0, recent: 0, topTags: [] };
    }
  }
}

export const memoryService = new MemoryService();