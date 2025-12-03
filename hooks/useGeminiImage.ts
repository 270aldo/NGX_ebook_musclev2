import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

interface ImageResult {
  imageData: string;
  mimeType: string;
  prompt: string;
}

interface UseGeminiImageReturn {
  isGenerating: boolean;
  generateImage: (prompt: string, sectionContext?: string) => Promise<ImageResult | null>;
  lastError: string | null;
}

export function useGeminiImage(): UseGeminiImageReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const generateImage = useCallback(async (
    prompt: string,
    sectionContext: string = ''
  ): Promise<ImageResult | null> => {
    if (!prompt.trim()) return null;

    setIsGenerating(true);
    setLastError(null);

    try {
      const finalPrompt = `Futuristic abstract 3D visualization of: "${prompt}".
        Context: Biology, skeletal muscle${sectionContext ? `, ${sectionContext}` : ''}.
        Style: Neon blue/purple/emerald glowing lines, dark background, medical data visualization, cinematic lighting, octane render.
        NO text, NO organs, NO gore. Abstract representation.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: {
          imageConfig: { aspectRatio: '1:1' },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return {
              imageData: part.inlineData.data as string,
              mimeType: part.inlineData.mimeType || 'image/png',
              prompt,
            };
          }
        }

        // Check for text fallback
        const textPart = response.candidates[0].content.parts.find(p => p.text);
        if (textPart?.text) {
          setLastError(textPart.text);
        } else {
          setLastError('No pude generar la imagen debido a restricciones de seguridad.');
        }
      }

      return null;
    } catch (err) {
      console.error('Image generation error:', err);
      setLastError('Error al generar la visualización.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    isGenerating,
    generateImage,
    lastError,
  };
}
