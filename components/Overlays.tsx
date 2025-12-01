import React, { useState, useMemo } from 'react';
import { 
  X, Search, Database, Trash2, Zap, ArrowRight, Activity, 
  BookOpen, Layers, Microscope, Cpu, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { BookSection, AgentKnowledgeItem } from '../types';
import { bookContent, agentKnowledgeBase } from '../data/content';

// --- SEARCH OVERLAY ---
interface SearchOverlayProps {
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return bookContent.filter(section => 
      section.title.toLowerCase().includes(query.toLowerCase()) ||
      section.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      section.textParts.some(p => p.content.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query]);

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col animate-in fade-in duration-200">
      <div className="max-w-3xl w-full mx-auto mt-24 p-6">
        <div className="relative group">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-50 group-focus-within:opacity-100 transition duration-500 blur"></div>
           <div className="relative flex items-center bg-[#0c0c0e] rounded-xl border border-white/10 p-4">
              <Search className="text-zinc-500 mr-4" size={24} />
              <input 
                autoFocus
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conceptos, módulos o términos..."
                className="bg-transparent text-xl text-white placeholder:text-zinc-600 focus:outline-none w-full font-light"
              />
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <X className="text-zinc-500" />
              </button>
           </div>
        </div>

        <div className="mt-8 space-y-4">
           {results.length > 0 ? (
             results.map(section => (
               <div 
                 key={section.id}
                 onClick={() => onNavigate(section.id)}
                 className="p-6 bg-zinc-900/50 border border-white/5 hover:border-blue-500/50 hover:bg-zinc-900 rounded-xl cursor-pointer group transition-all"
               >
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-mono text-blue-500 uppercase tracking-widest">{section.subtitle}</span>
                     <ArrowRight size={16} className="text-zinc-600 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                  </div>
                  <h3 className="text-xl text-white font-serif">{section.title}</h3>
               </div>
             ))
           ) : query.trim() ? (
             <div className="text-center py-12 text-zinc-600">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p>No se encontraron resultados en la base de datos.</p>
             </div>
           ) : (
             <div className="text-center py-12">
               <p className="text-zinc-600 text-sm">Escribe para iniciar el escaneo molecular...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- DATABASE OVERLAY ---
interface DatabaseOverlayProps {
  onClose: () => void;
}

export const DatabaseOverlay: React.FC<DatabaseOverlayProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-[#09090b] z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/5 bg-[#09090b]">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                    <Database className="text-emerald-500" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-serif text-white">Base de Datos Molecular</h2>
                    <p className="text-emerald-500/60 text-xs font-mono uppercase tracking-wider">Index Status: Online</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                <X size={24} />
            </button>
        </header>

        <div className="flex-1 overflow-y-auto p-12 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(agentKnowledgeBase).map(([key, item]) => (
                    <div key={key} className="bg-zinc-900/80 border border-white/10 hover:border-emerald-500/50 p-6 rounded-2xl backdrop-blur-sm group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20">
                        <div className="flex items-start justify-between mb-4">
                            <Microscope className="text-zinc-600 group-hover:text-emerald-400 transition-colors" size={20} />
                            <span className="text-[10px] font-mono text-zinc-600 group-hover:text-emerald-500/80">{key.toUpperCase()}</span>
                        </div>
                        <h3 className="text-lg text-white font-bold mb-2">{item.title}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6">{item.body}</p>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                             <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Acción Sugerida</span>
                             <span className="text-xs text-emerald-400 font-bold group-hover:underline cursor-pointer">{item.action}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

// --- SETTINGS OVERLAY ---
interface SettingsOverlayProps {
  onClose: () => void;
  onClearMemory: () => void;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ onClose, onClearMemory }) => {
    const [cleared, setCleared] = useState(false);

    const handleClear = () => {
        onClearMemory();
        setCleared(true);
        setTimeout(() => setCleared(false), 2000);
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600"></div>
                
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-serif text-white">Configuración del Sistema</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Cpu size={18} /></div>
                            <div>
                                <div className="text-sm text-white font-medium">Modo Alto Rendimiento</div>
                                <div className="text-xs text-zinc-500">Visualizaciones a 60FPS</div>
                            </div>
                        </div>
                        <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Layers size={18} /></div>
                            <div>
                                <div className="text-sm text-white font-medium">Capas de Realidad</div>
                                <div className="text-xs text-zinc-500">Superposición de datos AR</div>
                            </div>
                        </div>
                        <div className="w-10 h-5 bg-zinc-700 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-3 h-3 bg-zinc-400 rounded-full"></div></div>
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Zona de Peligro</h3>
                        <button 
                            onClick={handleClear}
                            disabled={cleared}
                            className={`w-full py-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-300 ${
                                cleared 
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                                : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                            }`}
                        >
                            {cleared ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            {cleared ? 'Memoria Purada' : 'Purgar Memoria Neural'}
                        </button>
                        <p className="text-[10px] text-zinc-600 mt-2 text-center">Esto reiniciará el contexto de conversación con Logos AI.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};