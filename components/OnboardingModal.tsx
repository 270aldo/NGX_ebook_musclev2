import React, { useState } from 'react';
import { Brain, Sparkles, BookOpen, MessageSquare, Zap, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips: string[];
  highlight: 'left' | 'right' | 'center';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Bienvenido a NGX',
    description: 'Tu viaje hacia el conocimiento muscular avanzado comienza aqui. Este ebook interactivo combina ciencia, visualizacion 3D e inteligencia artificial.',
    icon: <Brain size={48} className="text-blue-400" />,
    tips: [
      'Contenido basado en investigacion cientifica',
      'Visualizaciones 3D explorables',
      'IA conversacional con 5 modos especializados'
    ],
    highlight: 'center'
  },
  {
    title: 'Explora el Conocimiento',
    description: 'En el panel izquierdo encontraras el contenido del libro. Los modelos 3D son interactivos: rota, zoom y haz click en los puntos brillantes.',
    icon: <BookOpen size={48} className="text-purple-400" />,
    tips: [
      'Toggle 2D/3D para cambiar visualizacion',
      'Hotspots revelan informacion detallada',
      'Guarda insights con el icono de bookmark'
    ],
    highlight: 'left'
  },
  {
    title: 'Conversa con Logos',
    description: 'El panel derecho es tu asistente IA. Elige entre 5 modos especializados para adaptar las respuestas a tu estilo de aprendizaje.',
    icon: <MessageSquare size={48} className="text-emerald-400" />,
    tips: [
      'Cmd/Ctrl + K: Busqueda rapida',
      'Cmd/Ctrl + 1-5: Cambiar modo',
      'Modo Coach requiere registro'
    ],
    highlight: 'right'
  }
];

export default function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onSkip} />

      {/* Highlight overlays based on step */}
      {step.highlight === 'left' && (
        <div className="absolute left-[80px] top-0 bottom-0 w-[calc(50%-80px)] border-2 border-purple-500/50 bg-purple-500/5 pointer-events-none animate-pulse" />
      )}
      {step.highlight === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-[450px] border-2 border-emerald-500/50 bg-emerald-500/5 pointer-events-none animate-pulse" />
      )}

      {/* Modal */}
      <div className="relative z-10 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
          title="Omitir"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-lg">
              {step.icon}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-serif text-white text-center mb-4">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-zinc-400 text-center text-sm leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Tips */}
          <div className="bg-zinc-800/50 rounded-xl p-4 mb-8 border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Tips</span>
            </div>
            <ul className="space-y-2">
              {step.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <Sparkles size={12} className="text-blue-400 mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {ONBOARDING_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'bg-blue-500 w-6'
                    : i < currentStep
                    ? 'bg-blue-500/50'
                    : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                currentStep === 0
                  ? 'opacity-30 cursor-not-allowed text-zinc-500'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
            >
              {isLastStep ? 'Comenzar' : 'Siguiente'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Step counter */}
        <div className="bg-zinc-800/50 border-t border-white/5 px-8 py-3 flex items-center justify-center">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            Paso {currentStep + 1} de {ONBOARDING_STEPS.length}
          </span>
        </div>
      </div>
    </div>
  );
}
