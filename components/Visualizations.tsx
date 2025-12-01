import React, { useState } from 'react';
import { Activity, Zap, Brain, User } from 'lucide-react';

export const AbstractNetwork: React.FC = () => (
  <div className="w-full h-80 bg-zinc-900/30 rounded-3xl overflow-hidden relative border border-white/5 flex items-center justify-center group backdrop-blur-sm shadow-2xl">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50" />
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-32 h-32 rounded-full border border-blue-500/20 flex items-center justify-center animate-pulse relative">
        <div className="absolute inset-0 border border-t-blue-500/50 rounded-full animate-spin duration-[4s]"></div>
        <div className="w-20 h-20 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] flex items-center justify-center">
             <Activity className="text-blue-400 w-8 h-8 opacity-80" />
        </div>
      </div>
      <div className="mt-8 flex gap-3">
         {['CEREBRO', 'HÍGADO', 'HUESOS'].map(label => (
             <span key={label} className="text-[9px] font-bold tracking-widest text-blue-300/60 bg-blue-900/10 border border-blue-500/10 px-3 py-1.5 rounded-full uppercase hover:bg-blue-500/20 transition-colors cursor-default">{label}</span>
         ))}
      </div>
    </div>
  </div>
);

export const ParticleFlow: React.FC = () => (
  <div className="w-full h-80 bg-zinc-900/30 rounded-3xl overflow-hidden relative border border-white/5 flex items-center justify-center backdrop-blur-sm shadow-2xl">
    <div className="z-10 grid grid-cols-2 gap-16">
      <div className="text-center group cursor-pointer transition-transform hover:-translate-y-2 duration-300">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-transparent border border-emerald-500/20 flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:border-emerald-500/50 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all">
          <Zap size={28} className="text-emerald-400 group-hover:text-emerald-300" />
        </div>
        <span className="text-xs uppercase tracking-wider text-emerald-500 font-bold block mb-1">Irisina</span>
        <span className="text-[10px] text-zinc-500">Metabolismo</span>
      </div>
      <div className="text-center group cursor-pointer transition-transform hover:-translate-y-2 duration-300">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/20 flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:border-purple-500/50 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all">
          <Brain size={28} className="text-purple-400 group-hover:text-purple-300" />
        </div>
        <span className="text-xs uppercase tracking-wider text-purple-500 font-bold block mb-1">BDNF</span>
        <span className="text-[10px] text-zinc-500">Cognición</span>
      </div>
    </div>
  </div>
);

export const SimulationWidget: React.FC = () => {
    const [age, setAge] = useState(40);
    const [activity, setActivity] = useState<'sedentary' | 'active' | 'athlete'>('sedentary');
    
    // Logic to calculate decline curve
    const getCurvePoints = () => {
        let points = "";
        let startY = 80;
        const declineRate = activity === 'sedentary' ? 1.5 : activity === 'active' ? 0.8 : 0.4;
        
        for(let x=30; x<=90; x+=10) {
            let y = startY;
            if (x > 30) {
                let yearsPassed = x - 30;
                let drop = yearsPassed * declineRate * (x > 50 ? 1.5 : 1);
                y = startY - drop;
            }
            // Normalize X to 0-100 range (30yo=0, 90yo=100)
            let svgX = ((x - 30) / 60) * 100;
            // Normalize Y (invert for SVG, keep within bounds)
            let svgY = 100 - Math.max(0, y); 
            points += `${svgX},${svgY} `;
        }
        return points;
    };

    return (
        <div className="w-full bg-zinc-900/40 rounded-3xl border border-white/5 p-8 backdrop-blur-md shadow-2xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white font-serif text-xl">Simulador de Trayectoria</h3>
                    <p className="text-zinc-500 text-xs mt-1">Proyecta tu salud muscular basada en hábitos.</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
                    <button onClick={() => setActivity('sedentary')} className={`p-2 rounded ${activity === 'sedentary' ? 'bg-rose-500/20 text-rose-400' : 'text-zinc-500 hover:text-white'}`} title="Sedentario"><User size={16} /></button>
                    <button onClick={() => setActivity('active')} className={`p-2 rounded ${activity === 'active' ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-500 hover:text-white'}`} title="Activo"><Activity size={16} /></button>
                    <button onClick={() => setActivity('athlete')} className={`p-2 rounded ${activity === 'athlete' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-white'}`} title="Atleta"><Zap size={16} /></button>
                </div>
            </div>

            <div className="relative h-48 w-full bg-zinc-900/50 rounded-xl mb-6 overflow-hidden border border-white/5">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 divide-x divide-y divide-white/5"></div>
                
                {/* Curve */}
                <svg className="absolute inset-0 w-full h-full p-4 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline 
                        points={getCurvePoints()} 
                        fill="none" 
                        stroke={activity === 'sedentary' ? '#f43f5e' : activity === 'active' ? '#3b82f6' : '#10b981'} 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        className="transition-all duration-700 ease-out"
                    />
                    {/* User Dot */}
                    <circle cx={((age - 30) / 60) * 100} cy={100 - (80 - ((age - 30) * (activity === 'sedentary' ? 1.5 : activity === 'active' ? 0.8 : 0.4) * (age > 50 ? 1.5 : 1)))} r="2" fill="white" className="animate-ping" />
                </svg>
                
                {/* Labels */}
                <div className="absolute bottom-2 left-4 text-[10px] text-zinc-500">30 años</div>
                <div className="absolute bottom-2 right-4 text-[10px] text-zinc-500">90 años</div>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-xs text-zinc-400 w-16">Edad: {age}</span>
                <input 
                    type="range" 
                    min="30" 
                    max="90" 
                    value={age} 
                    onChange={(e) => setAge(parseInt(e.target.value))} 
                    className="flex-1 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-blue-400"
                />
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
                 <p className="text-sm text-zinc-300">
                    A los <span className="text-white font-bold">{Math.min(90, age + 20)} años</span>, tu capacidad funcional será del
                    <span className={`font-bold ml-1 ${activity === 'sedentary' ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {activity === 'sedentary' ? '45% (Riesgo Alto)' : activity === 'active' ? '75% (Óptimo)' : '90% (Elite)'}
                    </span>
                 </p>
            </div>
        </div>
    );
};
