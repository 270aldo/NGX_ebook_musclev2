import React, { useState } from 'react';
import { Trophy, Lock, ArrowRight, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EmailGateModalProps {
  onSubmit: (email: string) => Promise<void>;
  onClose: () => void;
}

export default function EmailGateModal({ onSubmit, onClose }: EmailGateModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Por favor ingresa un email valido');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(email);
      setSuccess(true);
      // Auto-close after success animation
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Error al registrar. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 bg-zinc-900 border border-emerald-500/20 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
        >
          <X size={20} />
        </button>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative p-8 pt-10">
          {success ? (
            // Success state
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-serif text-white mb-2">Acceso Desbloqueado</h3>
              <p className="text-zinc-400 text-sm">Modo Coach activado. Preparando...</p>
            </div>
          ) : (
            <>
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Trophy size={32} className="text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-serif text-white text-center mb-2">
                Desbloquea el Modo Coach
              </h2>

              {/* Subtitle */}
              <p className="text-zinc-400 text-center text-sm mb-6">
                Obtén planes de acción personalizados y protocolos de entrenamiento basados en ciencia.
              </p>

              {/* Benefits */}
              <div className="bg-zinc-800/50 rounded-xl p-4 mb-6 border border-white/5">
                <ul className="space-y-2">
                  {[
                    'Planes de entrenamiento personalizados',
                    'Protocolos de recuperación muscular',
                    'Recomendaciones nutricionales',
                    'Seguimiento de progreso'
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                      <CheckCircle size={12} className="text-emerald-400 shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={`w-full bg-zinc-800 border rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none transition-all ${
                      error
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:border-emerald-500'
                    }`}
                    disabled={isLoading}
                    autoFocus
                  />
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                      <AlertCircle size={12} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Desbloqueando...
                    </>
                  ) : (
                    <>
                      Desbloquear Ahora
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Privacy note */}
              <div className="flex items-center justify-center gap-2 mt-4 text-zinc-500 text-[10px]">
                <Lock size={10} />
                <span>No spam. Solo conocimiento muscular.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
