import { creditsService } from './creditsService';

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella voice ID
  private currentAudio: HTMLAudioElement | null = null;
  private speechUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'demo-key';
  }

  async textToSpeech(text: string, userId?: string): Promise<string | null> {
    // Check credits before proceeding (if userId provided)
    if (userId) {
      const canUseVoice = await creditsService.checkCredits(userId, 'VOICE_RESPONSE');
      if (!canUseVoice) {
        console.log('❌ Insufficient credits for voice response');
        throw new Error('INSUFFICIENT_CREDITS');
      }
    }

    if (this.apiKey === 'demo-key') {
      console.log('Demo mode: Using browser speech synthesis');
      return this.useBrowserSpeech(text, userId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      // Deduct credits after successful API call
      if (userId) {
        await creditsService.useCredits(userId, 'VOICE_RESPONSE');
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs API error:', error);
      return this.useBrowserSpeech(text, userId);
    }
  }

  private async useBrowserSpeech(text: string, userId?: string): Promise<string | null> {
    if ('speechSynthesis' in window) {
      // Deduct credits for browser speech as well
      if (userId) {
        const result = await creditsService.useCredits(userId, 'VOICE_RESPONSE');
        if (!result.success) {
          console.log('❌ Insufficient credits for browser speech');
          throw new Error('INSUFFICIENT_CREDITS');
        }
      }

      // Stop any existing speech first
      this.stopAudio();
      
      this.speechUtterance = new SpeechSynthesisUtterance(text);
      this.speechUtterance.rate = 0.9;
      this.speechUtterance.pitch = 1.0;
      this.speechUtterance.volume = 1.0;
      
      // Try to use a more natural voice
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google') ||
        (voice.lang.includes('en') && voice.name.includes('Female'))
      );
      
      if (preferredVoice) {
        this.speechUtterance.voice = preferredVoice;
      }

      speechSynthesis.speak(this.speechUtterance);
      return 'browser-speech';
    }
    
    return null;
  }

  async playAudio(audioUrl: string): Promise<void> {
    if (audioUrl === 'browser-speech') {
      // Browser speech is already playing
      return Promise.resolve();
    }

    try {
      this.stopAudio(); // Stop any currently playing audio
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.preload = 'auto';
      
      // Set volume and playback rate for better experience
      this.currentAudio.volume = 0.8;
      this.currentAudio.playbackRate = 1.0;
      
      await this.currentAudio.play();
      
      return new Promise((resolve, reject) => {
        if (!this.currentAudio) return reject(new Error('No audio element'));
        
        this.currentAudio.onended = () => {
          console.log('🔊 Audio playback ended');
          this.currentAudio = null;
          resolve();
        };
        this.currentAudio.onerror = () => {
          console.error('🔊 Audio playback failed');
          this.currentAudio = null;
          reject(new Error('Audio playback failed'));
        };
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      this.currentAudio = null;
      throw error;
    }
  }

  stopAudio(): void {
    console.log('🔇 Stopping all audio');
    
    // Stop HTML5 audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Clear speech utterance reference
    this.speechUtterance = null;
  }

  isPlaying(): boolean {
    if (this.currentAudio) {
      return !this.currentAudio.paused;
    }
    
    if ('speechSynthesis' in window) {
      return speechSynthesis.speaking;
    }
    
    return false;
  }

  // Method to adjust speech rate for voice conversation mode
  setSpeechRate(rate: number): void {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
    
    if (this.speechUtterance) {
      this.speechUtterance.rate = Math.max(0.1, Math.min(10, rate));
    }
  }

  // Method to get available voices for better selection
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }
}

export const elevenlabsService = new ElevenLabsService();