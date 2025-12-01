import React from 'react';
import { 
  ChevronRight, Activity, Zap, Brain, Bookmark, ArrowRight 
} from 'lucide-react';
import { Insight } from '../types';

interface UserDashboardProps {
  savedInsights: Insight[];
  onClose: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ savedInsights, onClose }) => (
    <div className="absolute inset-0 bg-[#09090b] z-50 flex flex-col animate-in slide-in-from-left duration-300">
        <header className="h-24 px-12 flex items-center justify-between border-b border-white/5">
            <div>
                <h2 className="text-3xl font-serif text-white">Tu Centro de Comando</h2>
                <p className="text-zinc-500 text-sm">Resumen de progreso y hallazgos.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><ChevronRight size={24} /></button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4 text-blue-400">
                        <Activity /> <span className="text-xs font-bold uppercase tracking-wider">Nivel de Lectura</span>
                    </div>
                    <div className="text-4xl font-mono text-white mb-1">Módulo 01</div>
                    <div className="w-full bg-zinc-800 h-1 mt-4 rounded-full overflow-hidden"><div className="w-1/3 bg-blue-500 h-full"></div></div>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <Zap /> <span className="text-xs font-bold uppercase tracking-wider">Insights Guardados</span>
                    </div>
                    <div className="text-4xl font-mono text-white mb-1">{savedInsights.length}</div>
                    <p className="text-xs text-zinc-500 mt-2">Ideas clave recolectadas.</p>
                </div>
                <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                        <Brain /> <span className="text-xs font-bold uppercase tracking-wider">Estado Cognitivo</span>
                    </div>
                    <div className="text-4xl font-mono text-white mb-1">Activo</div>
                    <p className="text-xs text-zinc-500 mt-2">Interactuando con Logos AI.</p>
                </div>
            </div>

            <h3 className="text-xl text-white font-serif mb-6">Colección de Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedInsights.length === 0 ? (
                    <div className="col-span-2 py-12 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-600">
                        No has guardado insights aún. Usa el icono <Bookmark className="inline w-4 h-4 mx-1"/> mientras lees.
                    </div>
                ) : (
                    savedInsights.map((insight, i) => (
                        <div key={i} className="p-6 bg-zinc-800/30 border border-white/5 rounded-xl hover:border-emerald-500/30 transition-colors cursor-pointer group">
                             <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-900/20 px-2 py-1 rounded">Módulo {insight.module}</span>
                                <ArrowRight size={16} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                             </div>
                             <p className="text-zinc-300 font-serif leading-relaxed">"{insight.text}"</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);

export default UserDashboard;
