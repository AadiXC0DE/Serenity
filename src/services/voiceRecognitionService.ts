import { VoiceRecognitionState } from '../types';

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;
  private callbacks: {
    onResult?: (transcript: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  } = {};

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
      this.setupRecognition();
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    // Improved settings for better recognition
    if ('webkitSpeechRecognition' in window) {
      (this.recognition as any).webkitSpeechRecognition = true;
    }

    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
      this.callbacks.onStart?.();
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Send the most recent transcript (final or interim)
      const currentTranscript = finalTranscript || interimTranscript;
      if (currentTranscript.trim()) {
        this.callbacks.onResult?.(currentTranscript.trim());
      }
    };

    this.recognition.onend = () => {
      console.log('🎤 Voice recognition ended');
      this.callbacks.onEnd?.();
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 Voice recognition error:', event.error);
      this.callbacks.onError?.(event.error);
    };

    this.recognition.onnomatch = () => {
      console.warn('🎤 No speech was recognized');
    };

    this.recognition.onspeechstart = () => {
      console.log('🎤 Speech detected');
    };

    this.recognition.onspeechend = () => {
      console.log('🎤 Speech ended');
    };
  }

  startListening(callbacks: {
    onResult?: (transcript: string) => void;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
  }): void {
    if (!this.isSupported || !this.recognition) {
      callbacks.onError?.('Speech recognition not supported');
      return;
    }

    this.callbacks = callbacks;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      callbacks.onError?.('Failed to start voice recognition');
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }

  isRecognitionSupported(): boolean {
    return this.isSupported;
  }

  // Method to check if recognition is currently active
  isListening(): boolean {
    return this.recognition !== null;
  }
}

export const voiceRecognitionService = new VoiceRecognitionService();