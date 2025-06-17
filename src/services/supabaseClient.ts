import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          preferences: {
            voiceEnabled: boolean;
            voiceSpeed: number;
            empathyLevel: number;
            preferredTechniques: string[];
            fullVoiceMode: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          preferences?: {
            voiceEnabled?: boolean;
            voiceSpeed?: number;
            empathyLevel?: number;
            preferredTechniques?: string[];
            fullVoiceMode?: boolean;
          };
        };
        Update: {
          name?: string;
          preferences?: {
            voiceEnabled?: boolean;
            voiceSpeed?: number;
            empathyLevel?: number;
            preferredTechniques?: string[];
            fullVoiceMode?: boolean;
          };
        };
      };
      user_memories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          embedding: number[] | null;
          importance: number;
          tags: string[];
          created_at: string;
          last_accessed: string;
        };
        Insert: {
          user_id: string;
          content: string;
          embedding?: number[] | null;
          importance?: number;
          tags?: string[];
        };
        Update: {
          content?: string;
          embedding?: number[] | null;
          importance?: number;
          tags?: string[];
          last_accessed?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          messages: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          session_id: string;
          messages?: any[];
        };
        Update: {
          messages?: any[];
        };
      };
    };
  };
}