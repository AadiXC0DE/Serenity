export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'therapist';
  timestamp: Date;
  technique?: string;
  mood?: string;
  audioUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  voiceEnabled: boolean;
  voiceSpeed: number;
  empathyLevel: number;
  preferredTechniques: string[];
  fullVoiceMode: boolean;
  userBio?: string;
  responseLength?: number;
  conversationStyle?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  mood?: string;
  techniques?: string[];
}

export interface UserMemory {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  importance: number;
  tags: string[];
  createdAt: Date;
  lastAccessed: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface VoiceRecognitionState {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
}

export interface VoiceConversationState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  status: 'idle' | 'listening' | 'processing' | 'speaking';
}