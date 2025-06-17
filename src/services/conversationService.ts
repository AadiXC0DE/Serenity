import { Message } from '../types';
import { supabase } from './supabaseClient';

class ConversationService {
  async saveConversation(userId: string, sessionId: string, messages: Message[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          messages: messages
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) {
        console.error('❌ Error saving conversation:', error);
        throw error;
      }

      console.log('✅ Conversation saved to Supabase');
    } catch (error) {
      console.error('❌ Error saving conversation:', error);
    }
  }

  async getConversationHistory(userId: string, limit: number = 5): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting conversation history:', error);
        return [];
      }

      console.log(`✅ Retrieved ${data?.length || 0} conversations`);
      return data || [];
    } catch (error) {
      console.error('❌ Error getting conversation history:', error);
      return [];
    }
  }

  async getConversation(userId: string, sessionId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('messages')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('❌ Error getting conversation:', error);
        return [];
      }

      return data?.messages || [];
    } catch (error) {
      console.error('❌ Error getting conversation:', error);
      return [];
    }
  }
}

export const conversationService = new ConversationService();