import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const VITE_GEMINI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || '';
export const ELEVENLABS_API_KEY = (import.meta as any).env.VITE_ELEVENLABS_API_KEY || '';
// Using a multilingual-friendly voice for better Uzbek pronunciation
export const ELEVENLABS_VOICE_ID = 'EXAVITQu4v4VsRxzFf8'; // Sarah - good for multilingual content

/**
 * Utility function to merge tailwind classes safely with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Strip markdown for TTS
 */
export const stripMarkdown = (text: string) =>
  text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/\n{2,}/g, '. ')
    .trim();

/**
 * Utility to speak text using ElevenLabs (Ultra-realistic "Human" voice)
 * with robust fallback to Google TTS and Browser Speech
 */
export const speakText = async (text: string, onEnd?: () => void, language: 'uz' | 'en' | 'ru' = 'uz') => {
  if (!text) return;
  window.speechSynthesis.cancel();
  const cleanText = stripMarkdown(text).slice(0, 4000);

  // Helper for browser-native fallback (last resort)
  const browserFallback = (txt: string, callback?: () => void) => {
    const utterance = new SpeechSynthesisUtterance(txt);
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find Uzbek voice first, then fallback to Russian or English
    const uzVoice = voices.find(v => v.lang.startsWith('uz'));
    const ruVoice = voices.find(v => v.lang.startsWith('ru') && (v.name.includes('Google') || v.name.includes('Female')));
    const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Female')));
    
    if (uzVoice) {
      utterance.voice = uzVoice;
      utterance.lang = 'uz-UZ';
    } else if (ruVoice) {
      utterance.voice = ruVoice;
      utterance.lang = 'ru-RU';
    } else if (enVoice) {
      utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }
    
    utterance.rate = 0.9;
    if (callback) utterance.onend = callback;
    window.speechSynthesis.speak(utterance);
  };

  try {
    // 1. Try ElevenLabs with language-specific settings
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
            style: 0.5,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!res.ok) throw new Error(`ElevenLabs failed: ${res.status}`);

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    audio.onended = () => {
      if (onEnd) onEnd();
      URL.revokeObjectURL(url);
    };

    audio.onerror = () => {
      console.warn("Audio playback error, trying Google TTS fallback");
      googleFallback(cleanText, onEnd);
    };

    await audio.play();
  } catch (e) {
    console.error("ElevenLabs failed, trying Google TTS fallback:", e);
    googleFallback(cleanText, onEnd);
  }

  // 2. Google Translate TTS Fallback
  function googleFallback(txt: string, callback?: () => void) {
    const chunks = txt.match(/[^.!?\n]+[.!?\n]*|[^.!?\n]+/g) || [txt];
    let currentChunk = 0;

    const playNextChunk = () => {
      if (currentChunk >= chunks.length) {
        if (callback) callback();
        return;
      }

      const chunkText = chunks[currentChunk].trim();
      if (!chunkText) {
        currentChunk++;
        playNextChunk();
        return;
      }

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${language}&client=tw-ob`;
      const audio = new Audio(url);

      audio.onended = () => {
        currentChunk++;
        playNextChunk();
      };

      audio.onerror = () => {
        console.warn("Google TTS failed, using browser fallback");
        browserFallback(chunkText, () => {
          currentChunk++;
          playNextChunk();
        });
      };

      audio.play().catch(err => {
        console.warn("Google TTS play blocked, using browser fallback", err);
        browserFallback(chunkText, () => {
          currentChunk++;
          playNextChunk();
        });
      });
    };
    playNextChunk();
  }
};

/**
 * Translate text using Google Translate web endpoint as a lightweight client-side helper.
 * Note: this is a simple helper and may be rate-limited. For production, use a server-side
 * translation API or an official SDK with an API key.
 */
export const translateText = async (text: string, target: 'ru' | 'uz' | 'en' = 'ru') => {
  if (!text) return text;
  try {
    // Use Google Translate web API endpoint for quick client-side translation
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!res.ok) throw new Error('Translate failed');
    const data = await res.json();
    // data[0] is an array of translations
    return data[0].map((p: any) => p[0]).join('') as string;
  } catch (e) {
    console.warn('translateText failed', e);
    return text; // fallback to original
  }
};
