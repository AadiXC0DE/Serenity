import { GoogleGenAI } from '@google/genai';
import { Message, User, UserMemory } from '../types';

interface TherapyContext {
  userMessage: string;
  conversationHistory: Message[];
  user: User;
  relevantMemories: UserMemory[];
}

class GeminiService {
  private genAI: GoogleGenAI | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      
      if (!apiKey || apiKey === 'demo-key') {
        console.log('Using demo mode for Gemini API');
        return;
      }

      this.genAI = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error('Error initializing Gemini:', error);
    }
  }

  async generateTherapyResponse(context: TherapyContext): Promise<string> {
    if (!this.genAI) {
      return this.generateNaturalDemoResponse(context);
    }

    try {
      const prompt = this.buildMemoryAwarePrompt(context);
      
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });
      
      return response.text || this.generateNaturalDemoResponse(context);
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateNaturalDemoResponse(context);
    }
  }

  private buildMemoryAwarePrompt(context: TherapyContext): string {
    const { userMessage, conversationHistory, user, relevantMemories } = context;

    // Format memories for context - only if they exist and are relevant
    const memoryContext = relevantMemories.length > 0 
      ? relevantMemories.map(m => {
          const timeAgo = this.getTimeAgo(m.createdAt);
          return `- ${m.content} (${timeAgo})`;
        }).join('\n')
      : '';

    // Recent conversation context
    const recentChat = conversationHistory.slice(-3).map(m => 
      `${m.sender === 'user' ? user.name : 'Serenity'}: ${m.content}`
    ).join('\n');

    // User bio context (use sparingly)
    const userBioContext = user.preferences.userBio 
      ? `\nUSER BACKGROUND (use only when relevant): ${user.preferences.userBio}\n`
      : '';

    // Response style preferences
    const responseLength = user.preferences.responseLength || 0.6;
    const conversationStyle = user.preferences.conversationStyle || 'Casual Friend';
    const empathyLevel = user.preferences.empathyLevel;

    const lengthGuidance = responseLength < 0.5 
      ? 'Keep responses very brief (1 sentence max)' 
      : responseLength > 0.8 
        ? 'Provide detailed, thoughtful responses (2-3 sentences)'
        : 'Keep responses moderate length (1-2 sentences)';

    const styleGuidance = {
      'Casual Friend': 'Be warm, casual, and supportive like a close friend',
      'Professional Therapist': 'Be professional, structured, and use therapeutic techniques',
      'Caring Mentor': 'Be wise, nurturing, and offer gentle guidance',
      'Supportive Coach': 'Be encouraging, motivational, and action-oriented'
    }[conversationStyle] || 'Be warm and supportive';

    return `You are Serenity, a warm, caring AI therapy companion.

USER: ${user.name}
CURRENT MESSAGE: "${userMessage}"

RECENT CONVERSATION:
${recentChat || 'This is the start of the conversation.'}

${memoryContext ? `RELEVANT CONTEXT FROM PAST:
${memoryContext}

` : ''}${userBioContext}PERSONALITY & STYLE:
- ${styleGuidance}
- Empathy level: ${Math.round(empathyLevel * 100)}% (${empathyLevel > 0.8 ? 'very caring' : empathyLevel > 0.6 ? 'balanced' : 'more direct'})
- ${lengthGuidance}
- Use loving terms SPARINGLY and only when truly appropriate (distress, comfort, celebration)
- Reserve "sweety", "love", "dear", "honey" for moments of genuine care, not casual conversation

WHEN TO USE AFFECTIONATE TERMS:
- When someone is clearly hurting or in distress
- When offering comfort during difficult times
- When celebrating achievements or good news
- When someone asks painful questions about self-worth
- NOT for casual conversation or simple responses

INSTRUCTIONS:
- ONLY reference past context if it's directly relevant to the current message
- DO NOT force connections to old topics unless the user brings them up
- Be conversational and caring, not clinical
- Focus on the current message and immediate context
- Use user bio information thoughtfully, not in every response

EXAMPLES OF APPROPRIATE LOVING RESPONSES:
- For pain: "Oh ${user.name}, that's so painful, sweety. Of course you deserve love!"
- For distress: "I'm so sorry you're going through this, love. What's been the hardest part?"
- For celebration: "That's wonderful news, dear! How does it feel?"
- For casual chat: "How has your day been?" (NO endearment needed)

CRISIS CHECK: If user mentions suicide/self-harm, respond: "${user.name}, I'm really concerned about you, sweety. Please reach out: 988 (Suicide Prevention), 741741 (Crisis Text), or 911. You're not alone, love. 💙"

Respond as Serenity with natural warmth and selective use of loving language, staying focused on what the user is saying RIGHT NOW.`;
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }

  private generateNaturalDemoResponse(context: TherapyContext): string {
    const { userMessage, user, relevantMemories } = context;
    
    // Crisis check first
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'can\'t go on', 'hopeless', 'want to die'];
    const lowerMessage = userMessage.toLowerCase();
    const hasCrisisContent = crisisKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasCrisisContent) {
      return `${user.name}, I'm really concerned about you, sweety. Please reach out: 988 (Suicide Prevention), 741741 (Crisis Text), or 911. You're not alone, love. 💙`;
    }

    // Check for emotional distress and respond with extra care
    const distressKeywords = ['hurt', 'pain', 'betrayed', 'cheated', 'broken', 'devastated', 'worthless', 'deserve'];
    const isDistressed = distressKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isDistressed) {
      if (lowerMessage.includes('deserve') && (lowerMessage.includes('love') || lowerMessage.includes('better'))) {
        const responses = [
          `Oh ${user.name}, that's a painful question, sweety. Of course you deserve love! Don't doubt that for a second.`,
          `Oh honey, why would you even ask that? You absolutely deserve love and so much more.`,
          `${user.name}, that breaks my heart to hear, love. You deserve all the love in the world.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      if (lowerMessage.includes('cheated') || lowerMessage.includes('betrayed')) {
        const responses = [
          `Oh ${user.name}, I'm so sorry you're dealing with this betrayal, sweety. That's incredibly painful.`,
          `That's such a deep hurt, dear. I can only imagine how devastating this feels.`,
          `Oh honey, betrayal cuts so deep. I'm here with you through this pain.`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
      }
      
      const responses = [
        `Oh ${user.name}, I'm so sorry you're hurting, sweety. That sounds incredibly tough.`,
        `I can hear the pain in your words, dear. I'm here with you.`,
        `That sounds so difficult, love. I'm sorry you're going through this.`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Check if user is indicating improvement - celebrate with warmth
    const improvementKeywords = ['better now', 'it\'s better', 'feeling better', 'improved', 'getting better', 'good news', 'excited', 'happy'];
    const isImprovement = improvementKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isImprovement) {
      const responses = [
        `That's wonderful to hear, dear! What's been helping you feel better?`,
        `I'm so glad things are improving! What's on your mind today?`,
        `That's such good news! How are you doing right now?`,
        `So happy to hear that! What would you like to talk about?`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Use memories sparingly and only when directly relevant
    let memoryContext = '';
    if (relevantMemories.length > 0) {
      const mostRelevant = relevantMemories[0];
      
      // Only reference memory if it's very recent or highly relevant
      const daysSince = (Date.now() - mostRelevant.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 3 && mostRelevant.importance > 0.7) {
        if (mostRelevant.content.includes('work') && lowerMessage.includes('work')) {
          memoryContext = 'How has work been? ';
        } else if (mostRelevant.content.includes('anxiety') && lowerMessage.includes('anxious')) {
          memoryContext = 'How is your anxiety today? ';
        }
      }
    }

    // Use user bio context sparingly
    let bioContext = '';
    if (user.preferences.userBio && user.preferences.userBio.length > 20) {
      const bioLower = user.preferences.userBio.toLowerCase();
      if (bioLower.includes('work') && lowerMessage.includes('work')) {
        bioContext = 'Given your work situation, ';
      } else if (bioLower.includes('family') && lowerMessage.includes('family')) {
        bioContext = 'With your family dynamics, ';
      }
    }

    // Generate responses based on current message - use endearments sparingly
    const responses = {
      greeting: [
        `Hey ${user.name}! How's your day going?`,
        `Hi there! What's on your mind?`,
        `Good to see you! How are you feeling today?`
      ],
      good: [
        `That's wonderful! Tell me more about what's going well.`,
        `I love hearing that! What's been the highlight?`,
        `That's great news, dear! How does it feel?`
      ],
      bad: [
        `I'm so sorry you're going through this. ${memoryContext}What's been the hardest part?`,
        `That sounds really tough. ${memoryContext}Want to talk about it?`,
        `I hear you. ${memoryContext}How are you coping with everything?`
      ],
      anxious: [
        `${memoryContext}Anxiety can be so overwhelming. What's triggering it today?`,
        `I can hear the worry. ${memoryContext}What helps you feel calmer?`,
        `That sounds stressful. ${memoryContext}What's your body telling you right now?`
      ],
      work: [
        `${bioContext}${memoryContext}Work stuff can be so draining. What's going on there?`,
        `How are things at work? ${memoryContext}Anything specific bothering you?`,
        `Work stress is real. ${memoryContext}What's been the biggest challenge?`
      ],
      sleep: [
        `Oh, sleep troubles are so hard. What's been keeping you up?`,
        `That sounds exhausting. How long has this been going on?`,
        `Sleep is so important. What's been on your mind at night?`
      ],
      general: [
        `${bioContext}${memoryContext}Tell me more about what's going on.`,
        `I'm here to listen. ${memoryContext}What's been on your mind?`,
        `${memoryContext}How has everything been lately?`
      ]
    };

    // Detect response type
    let responseType = 'general';
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      responseType = 'greeting';
    } else if (lowerMessage.includes('good') || lowerMessage.includes('great') || lowerMessage.includes('happy')) {
      responseType = 'good';
    } else if (lowerMessage.includes('bad') || lowerMessage.includes('terrible') || lowerMessage.includes('awful') || lowerMessage.includes('sad')) {
      responseType = 'bad';
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stress')) {
      responseType = 'anxious';
    } else if (lowerMessage.includes('work') || lowerMessage.includes('job') || lowerMessage.includes('boss')) {
      responseType = 'work';
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia') || lowerMessage.includes('can\'t sleep')) {
      responseType = 'sleep';
    }

    const categoryResponses = responses[responseType as keyof typeof responses];
    return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.genAI) {
      return this.createSimpleEmbedding(text);
    }

    try {
      // Use text-embedding-004 model which produces 768-dimensional embeddings
      const response = await this.genAI.models.embedContent({
        model: 'text-embedding-004',
        contents: text,
        config: {
          taskType: 'SEMANTIC_SIMILARITY'
        }
      });
      
      // Return the embedding values or fallback to simple embedding
      return response.embeddings?.[0]?.values || this.createSimpleEmbedding(text);
    } catch (error) {
      console.error('Error generating embedding:', error);
      return this.createSimpleEmbedding(text);
    }
  }

  private createSimpleEmbedding(text: string): number[] {
    // For demo purposes, create a simple hash-based embedding with 768 dimensions
    const hash = this.simpleHash(text);
    return Array.from({ length: 768 }, (_, i) => 
      Math.sin(hash + i) * 0.5 + 0.5
    );
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }
}

export const geminiService = new GeminiService();