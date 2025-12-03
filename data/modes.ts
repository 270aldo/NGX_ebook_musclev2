import { Brain, Palette, GraduationCap, Microscope, Trophy } from 'lucide-react';

export type AppMode = 'chat' | 'visual' | 'mentor' | 'research' | 'coach';

export interface ModeConfig {
    id: AppMode;
    label: string;
    icon: React.ElementType;
    color: string; // Tailwind color name (e.g. 'purple', 'amber')
    hex: string;
    placeholder: string;
    systemPromptPrefix: string;
    presets?: string[];
}

export const MODE_CONFIG: Record<AppMode, ModeConfig> = {
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
