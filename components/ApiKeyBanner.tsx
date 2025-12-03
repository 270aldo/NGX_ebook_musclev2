import React from 'react';
import { AlertTriangle, Key, X } from 'lucide-react';

interface ApiKeyBannerProps {
  onClose?: () => void;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ onClose }) => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md relative z-50 animate-in slide-in-from-top-full duration-500">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-500">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <AlertTriangle size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-wider">Modo Offline Detectado</span>
            <span className="text-xs text-amber-200/70">
              No se detectó una API Key de Gemini. Las funciones de IA (Chat, Visualización, Audio) están desactivadas.
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-[10px] text-amber-500/50 font-mono border border-amber-500/10 px-3 py-1.5 rounded bg-black/20">
            <Key size={12} />
            <span>VITE_GEMINI_API_KEY=...</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 hover:bg-amber-500/20 rounded text-amber-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
