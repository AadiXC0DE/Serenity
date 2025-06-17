import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { User, UserPreferences } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

class AuthService {
  private currentUser: User | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        throw error;
      }

      if (session?.user) {
        await this.loadUserProfile(session.user);
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          await this.loadUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
        }
      });

      this.isInitialized = true;
      console.log('✅ Auth service initialized');
    } catch (error) {
      console.error('❌ Error initializing auth service:', error);
      this.isInitialized = true;
      throw error;
    }
  }

  private async loadUserProfile(supabaseUser: SupabaseUser): Promise<void> {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ Error loading user profile:', error);
        return;
      }

      if (profile) {
        this.currentUser = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: new Date(profile.created_at),
          preferences: profile.preferences,
          credits: profile.credits || 0,
          creditsUsedToday: profile.credits_used_today || 0,
          unlimitedCredits: profile.unlimited_credits || false
        };
        console.log('✅ User profile loaded:', this.currentUser.name, `(${this.currentUser.credits} credits)`);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    }
  }

  async refreshUserCredits(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('credits, credits_used_today, unlimited_credits')
        .eq('id', this.currentUser.id)
        .single();

      if (error) {
        console.error('❌ Error refreshing credits:', error);
        return;
      }

      if (profile && this.currentUser) {
        this.currentUser.credits = profile.credits || 0;
        this.currentUser.creditsUsedToday = profile.credits_used_today || 0;
        this.currentUser.unlimitedCredits = profile.unlimited_credits || false;
        console.log('🔄 Credits refreshed:', this.currentUser.credits);
      }
    } catch (error) {
      console.error('❌ Error refreshing credits:', error);
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      
      // Validate input
      if (!credentials.email.trim()) {
        throw new Error('Please enter your email address');
      }
      
      if (!credentials.password.trim()) {
        throw new Error('Please enter your password');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      await this.loadUserProfile(data.user);

      if (!this.currentUser) {
        throw new Error('Failed to load user profile');
      }

      console.log('✅ Login successful for user:', this.currentUser.name);
      return this.currentUser;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    }
  }

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      console.log('📝 Attempting registration for:', credentials.email);
      
      // Validate input
      if (!credentials.name.trim()) {
        throw new Error('Please enter your full name');
      }
      
      if (!credentials.email.trim()) {
        throw new Error('Please enter your email address');
      }
      
      if (!credentials.password || credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email.trim(),
        password: credentials.password,
        options: {
          data: {
            name: credentials.name.trim()
          }
        }
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Registration failed - no user returned');
      }

      // Wait for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await this.loadUserProfile(data.user);

      if (!this.currentUser) {
        // If profile wasn't created by trigger, create it manually
        const defaultPreferences: UserPreferences = {
          voiceEnabled: true,
          voiceSpeed: 1.0,
          empathyLevel: 0.8,
          preferredTechniques: ['CBT', 'Mindfulness'],
          fullVoiceMode: false,
          userBio: '',
          responseLength: 0.6,
          conversationStyle: 'Casual Friend'
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email: credentials.email.trim(),
            name: credentials.name.trim(),
            preferences: defaultPreferences,
            credits: 100,
            credits_used_today: 0,
            last_credit_reset: new Date().toISOString().split('T')[0]
          });

        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
          throw new Error('Failed to create user profile');
        } else {
          await this.loadUserProfile(data.user);
        }
      }

      if (!this.currentUser) {
        throw new Error('Failed to create user profile');
      }

      console.log('✅ Registration successful for user:', this.currentUser.name);
      return this.currentUser;
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    }
  }

  async logout(): Promise<void> {
    console.log('👋 Logging out user:', this.currentUser?.name);
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Logout error:', error);
    }
    
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    if (!this.currentUser) throw new Error('No authenticated user');
    
    const updatedPreferences = { ...this.currentUser.preferences, ...preferences };
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', this.currentUser.id);

      if (error) {
        console.error('❌ Error updating preferences:', error);
        throw new Error('Failed to update preferences');
      }
      
      // Update local state
      this.currentUser.preferences = updatedPreferences;
      
      console.log('✅ Updated preferences for user:', this.currentUser.name);
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw new Error('Failed to update preferences');
    }
  }
}

export const authService = new AuthService();