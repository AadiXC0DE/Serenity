import { supabase } from './supabaseClient';
import { CreditUsageResult } from '../types';

class CreditsService {
  // Credit costs for different operations
  private readonly CREDIT_COSTS = {
    TEXT_MESSAGE: 0,     // Free for now
    VOICE_RESPONSE: 10,  // 10 credits per voice response
    VOICE_INPUT: 5,      // 5 credits per voice input (future)
    MEMORY_SEARCH: 1     // 1 credit per memory search (future)
  };

  async getUserCredits(userId: string): Promise<{
    credits: number;
    creditsUsedToday: number;
    unlimitedCredits: boolean;
  } | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_credits', {
        user_id: userId
      });

      if (error) {
        console.error('❌ Error getting user credits:', error);
        return null;
      }

      return {
        credits: data.credits || 0,
        creditsUsedToday: data.credits_used_today || 0,
        unlimitedCredits: data.unlimited_credits || false
      };
    } catch (error) {
      console.error('❌ Error getting user credits:', error);
      return null;
    }
  }

  async useCredits(
    userId: string, 
    operationType: keyof typeof this.CREDIT_COSTS,
    customCost?: number
  ): Promise<CreditUsageResult> {
    try {
      const creditCost = customCost || this.CREDIT_COSTS[operationType];
      
      // If it's a free operation, just return success
      if (creditCost === 0) {
        const userCredits = await this.getUserCredits(userId);
        return {
          success: true,
          creditsRemaining: userCredits?.credits || 0,
          creditsUsed: 0,
          unlimited: userCredits?.unlimitedCredits || false
        };
      }

      const { data, error } = await supabase.rpc('use_credits', {
        user_id: userId,
        credit_cost: creditCost,
        operation_type: operationType
      });

      if (error) {
        console.error('❌ Error using credits:', error);
        return {
          success: false,
          creditsRemaining: 0,
          error: 'Failed to process credits'
        };
      }

      console.log(`💳 Credits used: ${creditCost} for ${operationType}, remaining: ${data.credits_remaining}`);
      
      return {
        success: data.success,
        creditsRemaining: data.credits_remaining,
        creditsUsed: data.credits_used,
        error: data.error,
        unlimited: data.unlimited
      };
    } catch (error) {
      console.error('❌ Error using credits:', error);
      return {
        success: false,
        creditsRemaining: 0,
        error: 'Failed to process credits'
      };
    }
  }

  async checkCredits(
    userId: string, 
    operationType: keyof typeof this.CREDIT_COSTS,
    customCost?: number
  ): Promise<boolean> {
    try {
      const creditCost = customCost || this.CREDIT_COSTS[operationType];
      
      // Free operations are always allowed
      if (creditCost === 0) {
        return true;
      }

      const userCredits = await this.getUserCredits(userId);
      
      if (!userCredits) {
        return false;
      }

      // Unlimited credits users can always proceed
      if (userCredits.unlimitedCredits) {
        return true;
      }

      return userCredits.credits >= creditCost;
    } catch (error) {
      console.error('❌ Error checking credits:', error);
      return false;
    }
  }

  getCreditCost(operationType: keyof typeof this.CREDIT_COSTS): number {
    return this.CREDIT_COSTS[operationType];
  }

  // Method to grant unlimited credits (for admin use)
  async grantUnlimitedCredits(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ unlimited_credits: true })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error granting unlimited credits:', error);
        return false;
      }

      console.log('✅ Unlimited credits granted to user:', userId);
      return true;
    } catch (error) {
      console.error('❌ Error granting unlimited credits:', error);
      return false;
    }
  }

  // Method to add credits to a user
  async addCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ credits: supabase.raw(`credits + ${amount}`) })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error adding credits:', error);
        return false;
      }

      console.log(`✅ Added ${amount} credits to user:`, userId);
      return true;
    } catch (error) {
      console.error('❌ Error adding credits:', error);
      return false;
    }
  }

  // Get formatted credit status message
  getCreditsStatusMessage(credits: number, unlimitedCredits: boolean): string {
    if (unlimitedCredits) {
      return 'Unlimited credits';
    }
    
    if (credits === 0) {
      return 'No credits remaining - unlimited text for limited time!';
    }
    
    return `${credits} credits remaining`;
  }

  // Check if voice is available for user
  canUseVoice(credits: number, unlimitedCredits: boolean): boolean {
    if (unlimitedCredits) {
      return true;
    }
    
    return credits >= this.CREDIT_COSTS.VOICE_RESPONSE;
  }
}

export const creditsService = new CreditsService();