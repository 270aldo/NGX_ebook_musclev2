import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, FileText, LayoutGrid, Brain, Zap, Sparkles, Bookmark, 
  User, TrendingUp, ArrowRight, Image as ImageIcon, Loader2, X, Palette,
  Microscope, GraduationCap, Trophy, Search, Settings, Database, Activity
} from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { AbstractNetwork, ParticleFlow, SimulationWidget } from './Visualizations';
import UserDashboard from './UserDashboard';
import { SearchOverlay, DatabaseOverlay, SettingsOverlay } from './Overlays';
import { bookContent, agentKnowledgeBase } from '../data/content';
import { ChatMessage, Insight } from '../types';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Helper Functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- MODES CONFIGURATION ---
type AppMode = 'chat' | 'visual' | 'mentor' | 'research' | 'coach';

interface ModeConfig {
    id: AppMode;
    label: string;
    icon: React.ElementType;
    color: string; // Tailwind color name (e.g. 'purple', 'amber')
    hex: string;
    placeholder: string;
    systemPromptPrefix: string;
    presets?: string[];
}

const MODE_CONFIG: Record<AppMode, ModeConfig> = {
    chat: {
        id: 'chat',
        label: 'Logos AI',
        icon: Brain,
        color: 'blue',
        hex: '#3b82f6',
        placeholder: 'Pregunta a Logos...',
        systemPromptPrefix: 'Eres Logos, un tutor de IA avanzado. Responde de forma concisa, científica pero accesible. Usa un tono ligeramente futurista.'
    },
    visual: {
        id: 'visual',
        label: 'Visual Engine',
        icon: Palette,
        color: 'purple',
        hex: '#a855f7',
        placeholder: 'Describe lo que quieres ver...',
        systemPromptPrefix: '', // Handled separately
        presets: ['Red Muscular Global', 'Sinapsis Neuronal', 'Explosión de Energía', 'Estructura Ósea', 'Mitocondria Abstracta']
    },
    mentor: {
        id: 'mentor',
        label: 'Modo Mentor',
        icon: GraduationCap,
        color: 'amber',
        hex: '#f59e0b',
        placeholder: '¿Qué concepto quieres simplificar?',
        systemPromptPrefix: 'ACTÚA COMO: Un profesor amable y paciente para niños curiosos. Tu objetivo es usar analogías simples, metáforas cotidianas y evitar jerga técnica compleja. Explica los conceptos de fisiología como si fueran historias o juegos.'
    },
    research: {
        id: 'research',
        label: 'Lab Research',
        icon: Microscope,
        color: 'cyan',
        hex: '#06b6d4',
        placeholder: '¿Qué evidencia científica buscas?',
        systemPromptPrefix: 'ACTÚA COMO: Un investigador científico riguroso de PhD. Tu tono es clínico, preciso y basado en datos. Cita estudios (ficticios pero plausibles si no tienes acceso a internet real), usa terminología anatómica exacta y céntrate en la bioquímica y los mecanismos moleculares.'
    },
    coach: {
        id: 'coach',
        label: 'Performance Coach',
        icon: Trophy,
        color: 'emerald',
        hex: '#10b981',
        placeholder: '¿Cuál es tu objetivo físico?',
        systemPromptPrefix: 'ACTÚA COMO: Un entrenador de alto rendimiento de élite. Tu tono es enérgico, directo, motivador e imperativo. Usa viñetas, pasos de acción claros (1, 2, 3) y enfócate en la aplicación práctica del conocimiento para obtener resultados.'
    }
};

type OverlayState = 'none' | 'dashboard' | 'search' | 'database' | 'settings';

export default function NGXUltimateBook() {
  const [activeSectionId, setActiveSectionId] = useState('intro');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  
  // New robust overlay state management
  const [activeOverlay, setActiveOverlay] = useState<OverlayState>('none');

  const [savedInsights, setSavedInsights] = useState<Insight[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // UI Mode State
  const [activeMode, setActiveMode] = useState<AppMode>('chat');
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'agent', 
      type: 'text',
      content: 'Bienvenido. Soy Logos. Selecciona un modo abajo para interactuar: Mentor, Investigador, Coach o Visualizador.' 
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeSectionData = bookContent.find(s => s.id === activeSectionId) || bookContent[0];
  const currentConfig = MODE_CONFIG[activeMode];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping, activeMode]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleSaveInsight = (text: string, module: string) => {
      setSavedInsights(prev => [...prev, {text, module}]);
  };

  const handleKeywordClick = (keywordId: string) => {
    const info = agentKnowledgeBase[keywordId];
    if (!info) return;
    setChatHistory(prev => [...prev, { role: 'agent', type: 'card', ...info }]);
    setActiveOverlay('none'); // Close any open overlays to focus on chat
  };

  const handleScrollToSection = (sectionId: string) => {
      setActiveOverlay('none');
      setActiveSectionId(sectionId);
      const element = document.getElementById(sectionId);
      if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const handleClearMemory = () => {
      setChatHistory([{ 
          role: 'agent', 
          type: 'text',
          content: 'Memoria purgada. Sistemas reiniciados. ¿En qué puedo ayudarte hoy?' 
      }]);
  };

  const handleSubmit = () => {
      if (activeMode === 'visual') {
          handleGenerateVisual(userInput);
      } else {
          handleSendMessage();
      }
  };

  // --- FEATURE 1: REAL GEMINI CHAT (MULTI-MODE) ---
  const handleSendMessage = async (text: string = userInput) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', type: 'text', content: text };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsTyping(true);

    try {
        const sectionContext = `
            CONTEXTO DEL LIBRO (Fuente de verdad):
            Título: ${activeSectionData.title}
            Subtítulo: ${activeSectionData.subtitle}
            Contenido: ${activeSectionData.textParts.map(p => p.content).join(' ')}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: text,
            config: {
                systemInstruction: `${currentConfig.systemPromptPrefix}
                ${sectionContext}`
            }
        });

        const reply = response.text || "Lo siento, no pude procesar eso.";
        setChatHistory(prev => [...prev, { role: 'agent', type: 'text', content: reply }]);
    } catch (error) {
        console.error(error);
        setChatHistory(prev => [...prev, { role: 'agent', type: 'text', content: "Error de conexión con la red neural." }]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- FEATURE 2: IMAGE GENERATION ---
  const handleGenerateVisual = async (customPrompt: string) => {
    if (!customPrompt.trim()) return;

    // We stay in visual mode to allow consecutive generations
    setUserInput('');
    setIsTyping(true);
    setChatHistory(prev => [...prev, { role: 'user', type: 'text', content: `Visualizar: ${customPrompt}` }]);
    
    try {
        const finalPrompt = `Futuristic abstract 3D visualization of: "${customPrompt}". 
        Context: Biology, skeletal muscle, ${activeSectionData.title}.
        Style: Neon blue/purple/emerald glowing lines, dark background, medical data visualization, cinematic lighting, octane render. 
        NO text, NO organs, NO gore. Abstract representation.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: { parts: [{ text: finalPrompt }] },
            config: {
                imageConfig: { aspectRatio: '1:1' }
            }
        });

        let imageFound = false;
        let textFallback = "";
        
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64String = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType || 'image/png';
                    
                    setChatHistory(prev => [...prev, { 
                        role: 'agent', 
                        type: 'image', 
                        imageData: base64String,
                        mimeType: mimeType,
                        content: `Visualización: ${customPrompt}`
                    }]);
                    imageFound = true;
                    break;
                } else if (part.text) {
                    textFallback += part.text;
                }
            }
        }
        
        if (!imageFound) {
             const fallbackMsg = textFallback || "No pude generar la imagen debido a restricciones de seguridad.";
             setChatHistory(prev => [...prev, { role: 'agent', type: 'text', content: fallbackMsg }]);
        }

    } catch (error) {
        console.error(error);
        setChatHistory(prev => [...prev, { role: 'agent', type: 'text', content: "Error al generar la visualización." }]);
    } finally {
        setIsTyping(false);
    }
  };

  // --- FEATURE 3: TEXT TO SPEECH ---
  const toggleAudio = async () => {
    if (isPlaying) {
        audioSourceRef.current?.stop();
        setIsPlaying(false);
        return;
    }

    setIsAudioLoading(true);
    try {
        const textToRead = activeSectionData.textParts.map(p => p.content).join(' ');

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToRead }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (base64Audio) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
            }
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000,
                1,
            );

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsPlaying(false);
            source.start();
            
            audioSourceRef.current = source;
            setIsPlaying(true);
        }

    } catch (error) {
        console.error("TTS Error", error);
        setChatHistory(prev => [...prev, { role: 'agent', type: 'text', content: "Error al iniciar el sistema de audio." }]);
    } finally {
        setIsAudioLoading(false);
    }
  };

  // --- STYLE HELPERS ---
  const getThemeClasses = (color: string) => {
      switch(color) {
          case 'purple': return {
              bg: 'bg-purple-900/30', border: 'border-purple-500/30', text: 'text-purple-400', 
              inputBorder: 'focus-within:border-purple-500', btnBg: 'bg-purple-600', btnHover: 'hover:bg-purple-500',
              msgBg: 'bg-purple-900/50', msgBorder: 'border-purple-500/50'
          };
          case 'amber': return {
              bg: 'bg-amber-900/30', border: 'border-amber-500/30', text: 'text-amber-400', 
              inputBorder: 'focus-within:border-amber-500', btnBg: 'bg-amber-600', btnHover: 'hover:bg-amber-500',
              msgBg: 'bg-amber-900/50', msgBorder: 'border-amber-500/50'
          };
          case 'cyan': return {
              bg: 'bg-cyan-900/30', border: 'border-cyan-500/30', text: 'text-cyan-400', 
              inputBorder: 'focus-within:border-cyan-500', btnBg: 'bg-cyan-600', btnHover: 'hover:bg-cyan-500',
              msgBg: 'bg-cyan-900/50', msgBorder: 'border-cyan-500/50'
          };
          case 'emerald': return {
              bg: 'bg-emerald-900/30', border: 'border-emerald-500/30', text: 'text-emerald-400', 
              inputBorder: 'focus-within:border-emerald-500', btnBg: 'bg-emerald-600', btnHover: 'hover:bg-emerald-500',
              msgBg: 'bg-emerald-900/50', msgBorder: 'border-emerald-500/50'
          };
          default: return { // Blue
              bg: 'bg-zinc-800', border: 'border-white/10', text: 'text-white', 
              inputBorder: 'focus-within:border-blue-500', btnBg: 'bg-blue-600', btnHover: 'hover:bg-blue-500',
              msgBg: 'bg-blue-600', msgBorder: 'border-blue-500'
          };
      }
  };

  const theme = getThemeClasses(currentConfig.color);

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-300 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* OVERLAYS SYSTEM */}
      {activeOverlay === 'dashboard' && (
        <UserDashboard savedInsights={savedInsights} onClose={() => setActiveOverlay('none')} />
      )}
      {activeOverlay === 'search' && (
        <SearchOverlay onClose={() => setActiveOverlay('none')} onNavigate={handleScrollToSection} />
      )}
      {activeOverlay === 'database' && (
        <DatabaseOverlay onClose={() => setActiveOverlay('none')} />
      )}
      {activeOverlay === 'settings' && (
        <SettingsOverlay onClose={() => setActiveOverlay('none')} onClearMemory={handleClearMemory} />
      )}

      {/* SIDEBAR */}
      <aside className="w-[80px] border-r border-white/5 flex flex-col items-center py-6 z-30 bg-[#09090b] shrink-0">
        <div className="w-10 h-10 bg-white text-black font-bold font-mono rounded-xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(255,255,255,0.2)]">N</div>
        
        <nav className="flex flex-col gap-4 w-full px-4">
          <button 
            onClick={() => setActiveOverlay('none')} 
            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${activeOverlay === 'none' ? 'bg-zinc-800 text-white border border-white/10' : 'text-zinc-500 hover:text-white'}`} 
            title="Contenido"
          >
             <FileText size={20} />
          </button>
          <button 
            onClick={() => setActiveOverlay('dashboard')} 
            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${activeOverlay === 'dashboard' ? 'bg-zinc-800 text-white border border-white/10' : 'text-zinc-500 hover:text-white'}`} 
            title="Dashboard"
          >
             <LayoutGrid size={20} />
          </button>
          <div className="w-full h-px bg-white/5 my-2"></div>
           <button 
            onClick={() => setActiveOverlay('search')}
            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${activeOverlay === 'search' ? 'bg-zinc-800 text-white border border-white/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`} 
            title="Búsqueda Molecular"
           >
             <Search size={20} />
          </button>
           <button 
            onClick={() => setActiveOverlay('database')}
            className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all ${activeOverlay === 'database' ? 'bg-zinc-800 text-white border border-white/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'}`} 
            title="Base de Datos"
           >
             <Database size={20} />
          </button>
        </nav>

        {/* Vertical Progress Tracker */}
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-2 my-6 opacity-40 hover:opacity-100 transition-opacity cursor-default group">
             {bookContent.map((section, idx) => (
                <div 
                    key={idx} 
                    className={`w-1 rounded-full transition-all duration-500 ease-out ${
                        activeSectionId === section.id 
                        ? 'h-12 bg-blue-500 shadow-[0_0_15px_#3b82f6]' 
                        : 'h-1.5 bg-zinc-700 group-hover:bg-zinc-600'
                    }`}
                ></div>
             ))}
        </div>
        
        <div className="mt-auto flex flex-col gap-4 items-center w-full">
            {/* System Status Bio-Widget */}
           <div className="w-12 h-8 rounded-md bg-black/50 border border-white/5 flex items-center justify-center relative overflow-hidden" title="System Status: Optimal">
                <div className="absolute inset-0 bg-emerald-500/5"></div>
                <Activity size={14} className="text-emerald-500/80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
           </div>

           <button 
             onClick={() => setActiveOverlay('settings')}
             className={`text-zinc-500 hover:text-white mb-2 transition-colors ${activeOverlay === 'settings' ? 'text-white' : ''}`} 
             title="Configuración"
           >
             <Settings size={20} />
           </button>

           <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-white">JP</span>
              </div>
           </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: CONTENT */}
        <section className="flex-1 flex flex-col relative border-r border-white/5 min-w-0">
          
          {/* Top Floating Bar */}
          <div className="absolute top-6 left-12 right-12 z-20 flex items-center justify-between pointer-events-none">
             <div className="flex items-center gap-4 pointer-events-auto bg-zinc-900/80 backdrop-blur-md p-1 pr-4 rounded-full border border-white/10 shadow-xl transition-all">
                <button 
                    onClick={toggleAudio} 
                    disabled={isAudioLoading}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isAudioLoading ? <Loader2 size={14} className="animate-spin" /> : (isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />)}
                </button>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">NGX Audio Experience</span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                        {isPlaying ? 'NARRANDO EN TIEMPO REAL...' : 'CLIC PARA NARRACIÓN NEURAL'}
                    </span>
                </div>
                {/* Dynamic Waveform Visualization */}
                <div className="flex items-center gap-0.5 h-3 ml-2">
                    {[...Array(8)].map((_,i) => (
                        <div key={i} className={`w-0.5 bg-blue-500 rounded-full transition-all duration-150 ${isPlaying ? 'animate-pulse' : 'h-1 opacity-20'}`} style={{height: isPlaying ? `${Math.random()*12+4}px` : '4px'}}></div>
                    ))}
                </div>
             </div>
          </div>

          {/* Book Content */}
          <div className="flex-1 overflow-y-auto px-12 lg:px-24 py-32 no-scrollbar scroll-smooth">
            {bookContent.map((section) => (
              <article 
                key={section.id} 
                id={section.id} // Added ID for scroll targeting
                className="mb-48 group max-w-4xl mx-auto" 
                onMouseEnter={() => setActiveSectionId(section.id)}
              >
                <header className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="w-6 h-px bg-blue-500"></span>
                    <span className="text-[10px] font-mono tracking-[0.2em] text-blue-400 uppercase">{section.subtitle}</span>
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-serif text-white leading-[1.1] tracking-tight mb-8">
                    {section.title}
                  </h2>
                </header>

                <div className="mb-16 transform transition-all duration-1000">
                  {section.visualType === 'network' && <AbstractNetwork />}
                  {section.visualType === 'particles' && <ParticleFlow />}
                  {section.visualType === 'simulation' && <SimulationWidget />}
                </div>

                <div className="prose prose-invert prose-lg text-zinc-400 font-light leading-loose max-w-none">
                  <div>
                    {section.textParts.map((part, i) => {
                      if (part.type === 'keyword') {
                        return (
                          <span 
                            key={i}
                            onClick={() => part.id && handleKeywordClick(part.id)}
                            className="text-blue-400 font-normal border-b border-blue-500/30 hover:bg-blue-500/10 hover:border-blue-400 cursor-pointer transition-all px-0.5 rounded"
                          >
                            {part.content}
                          </span>
                        );
                      } else if (part.type === 'insight') {
                        return (
                          <div key={i} className="block my-12 p-8 bg-zinc-900/30 border-l border-emerald-500/50 rounded-r-2xl relative group/insight hover:bg-zinc-900/50 transition-colors">
                             <div className="flex items-center justify-between mb-4">
                                <span className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                                  <Sparkles size={12} /> Insight Clave
                                </span>
                                <button 
                                    onClick={() => handleSaveInsight(part.content, section.subtitle)}
                                    className="text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 p-2 rounded-full transition-all"
                                    title="Guardar en Dashboard"
                                >
                                  <Bookmark size={18} />
                                </button>
                             </div>
                             <span className="text-zinc-200 italic font-serif text-2xl block leading-relaxed">{part.content}</span>
                          </div>
                        );
                      }
                      return <span key={i}>{part.content}</span>;
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* RIGHT PANEL: INTELLIGENCE ENGINE */}
        <section className={`w-[450px] bg-[#0c0c0e] flex flex-col border-l border-white/5 shrink-0 relative transition-all duration-500`}>
          
          {/* Agent Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0c0c0e]/90 backdrop-blur-sm z-10">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 shadow-inner transition-colors duration-300 ${activeMode !== 'chat' ? theme.bg : 'bg-gradient-to-br from-zinc-800 to-zinc-900'}`}>
                   <currentConfig.icon size={16} className={theme.text} />
              </div>
              <div>
                 <span className={`text-xs font-bold tracking-widest uppercase block transition-colors duration-300 ${activeMode !== 'chat' ? theme.text : 'text-white'}`}>
                    {currentConfig.label}
                 </span>
                 <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-white animate-ping' : 'bg-emerald-500'} `} style={{backgroundColor: isTyping ? undefined : currentConfig.hex}}></span> {isTyping ? 'PROCESANDO...' : 'ONLINE'}
                 </span>
              </div>
            </div>
            
            {activeMode !== 'chat' && (
                <button 
                    onClick={() => setActiveMode('chat')} 
                    className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                    title="Cerrar modo visual"
                >
                    <X size={14} />
                </button>
            )}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] scroll-smooth">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                
                {msg.type === 'text' && (
                  <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg border ${
                    msg.role === 'user' 
                      ? `${activeMode !== 'chat' ? `${theme.msgBg} ${theme.msgBorder} text-white` : 'bg-blue-600 border-blue-500 text-white'} rounded-br-none`
                      : 'bg-zinc-900 text-zinc-300 border-white/10 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                )}

                {msg.type === 'image' && msg.imageData && (
                     <div className="w-full bg-zinc-900 border border-purple-500/30 rounded-xl overflow-hidden shadow-xl mt-1 group">
                        <div className="relative aspect-square w-full overflow-hidden">
                            <img src={`data:${msg.mimeType || 'image/png'};base64,${msg.imageData}`} alt="Generated visual" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                            
                            {/* Bottom Controls/Watermark */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                                {/* AI Label */}
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded backdrop-blur-md uppercase font-bold tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                    Logos AI
                                </span>

                                {/* NGX Watermark */}
                                <div className="flex items-center gap-2 opacity-90">
                                     <span className="text-[10px] font-mono text-white/70 tracking-[0.3em] font-bold drop-shadow-md">NGX</span>
                                     <div className="w-5 h-5 bg-white text-black text-[10px] font-bold font-mono rounded-md flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.3)]">N</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-white/5 bg-zinc-900/50">
                            <p className="text-zinc-400 text-xs font-light leading-relaxed">{msg.content}</p>
                        </div>
                     </div>
                )}

                {msg.type === 'card' && (
                   <div className="w-full bg-zinc-900 border border-emerald-500/20 rounded-xl overflow-hidden shadow-xl mt-1">
                      <div className="bg-emerald-900/10 p-3 border-b border-emerald-500/10 flex items-center gap-2 text-emerald-400">
                            <Zap size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Concepto</span>
                      </div>
                      <div className="p-4">
                         <h4 className="text-white font-serif text-base mb-2">{msg.title}</h4>
                         <p className="text-zinc-400 text-xs leading-relaxed mb-4">{msg.body}</p>
                         <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded border border-white/5 transition-all">
                            {msg.action}
                         </button>
                      </div>
                   </div>
                )}
              </div>
            ))}
            
            {isTyping && (
                <div className="flex items-center gap-2 text-zinc-600 text-xs p-2 animate-pulse">
                    <currentConfig.icon size={14} style={{color: currentConfig.hex}} /> 
                    <span style={{color: currentConfig.hex}}>
                        {activeMode === 'visual' ? 'Generando visualización...' : `${currentConfig.label} escribiendo...`}
                    </span>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area + Quick Actions */}
          <div className={`p-4 bg-[#0c0c0e] border-t relative z-20 transition-all duration-300 ${activeMode !== 'chat' ? `${theme.border} shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)]` : 'border-white/5'}`} style={{borderColor: activeMode !== 'chat' ? `${currentConfig.hex}40` : undefined}}>
             
             {/* Presets or Mode Switchers */}
             <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 min-h-[30px]">
                {activeMode === 'visual' ? (
                    // VISUAL PRESETS
                    (currentConfig.presets || []).map((preset, i) => (
                        <button
                            key={i}
                            onClick={() => handleGenerateVisual(preset)}
                            className="flex items-center gap-1.5 whitespace-nowrap bg-purple-900/20 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400 text-purple-200 text-[10px] px-3 py-1.5 rounded-full transition-all animate-in fade-in slide-in-from-bottom-1"
                        >
                            <Sparkles size={10} /> {preset}
                        </button>
                    ))
                ) : (
                    // MODE SWITCHERS
                    activeMode === 'chat' && [
                        { mode: 'mentor', label: "Explícamelo como niño" },
                        { mode: 'visual', label: "Visualizar concepto" },
                        { mode: 'research', label: "Paper Científico" },
                        { mode: 'coach', label: "Plan de Acción" }
                    ].map((item, i) => {
                        const mConfig = MODE_CONFIG[item.mode as AppMode];
                        const MIcon = mConfig.icon;
                        return (
                            <button 
                                key={i}
                                onClick={() => setActiveMode(item.mode as AppMode)}
                                className="flex items-center gap-1.5 whitespace-nowrap bg-zinc-800 hover:bg-zinc-700 border border-white/5 hover:border-white/20 text-zinc-300 text-[10px] px-3 py-1.5 rounded-full transition-all"
                            >
                                <MIcon size={12} style={{color: mConfig.hex}} /> {item.label}
                            </button>
                        );
                    })
                )}
                
                {activeMode !== 'chat' && activeMode !== 'visual' && (
                     <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                        <span className="uppercase tracking-wider">Modo Activo:</span>
                        <span className={`px-2 py-0.5 rounded ${theme.bg} ${theme.text} border ${theme.border} font-bold`}>{currentConfig.label}</span>
                     </div>
                )}
             </div>

             <div className={`flex items-center gap-2 bg-zinc-900 rounded-2xl p-2 border transition-all duration-300 ${theme.inputBorder}`}>
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder={currentConfig.placeholder}
                  className={`flex-1 bg-transparent text-sm placeholder:text-zinc-600 focus:outline-none font-light pl-2 ${activeMode !== 'chat' ? theme.text : 'text-white'}`}
                  style={{color: activeMode !== 'chat' ? currentConfig.hex : undefined}}
                />
                <button 
                  onClick={handleSubmit} 
                  disabled={!userInput.trim() || isTyping}
                  className={`p-2 rounded-xl transition-all text-white ${
                      !userInput.trim() ? 'opacity-50 bg-zinc-800' : theme.btnBg
                  } ${theme.btnHover}`}
                >
                   {activeMode === 'visual' ? <Sparkles size={16} /> : <ArrowRight size={16} />}
                </button>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}