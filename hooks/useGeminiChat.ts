import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';
import { ModeConfig } from '../data/modes';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

interface UseGeminiChatReturn {
  isTyping: boolean;
  sendMessage: (
    text: string,
    modeConfig: ModeConfig,
    sectionContext: string
  ) => Promise<string>;
  lastError: string | null;
}

export function useGeminiChat(): UseGeminiChatReturn {
  const [isTyping, setIsTyping] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    text: string,
    modeConfig: ModeConfig,
    sectionContext: string
  ): Promise<string> => {
    if (!text.trim()) return '';

    setIsTyping(true);
    setLastError(null);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
          systemInstruction: `${modeConfig.systemPromptPrefix}
            ${sectionContext}`,
        },
      });

      const reply = response.text || 'Lo siento, no pude procesar eso.';
      return reply;
    } catch (err) {
      console.error('Chat error:', err);
      setLastError('Error de conexión con la red neural. Verifica tu conexión o API Key.');
      throw err;
    } finally {
      setIsTyping(false);
    }
  }, []);

  return {
    isTyping,
    sendMessage,
    lastError,
  };
}
