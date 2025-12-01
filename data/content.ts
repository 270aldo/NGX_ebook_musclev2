import { BookSection, AgentKnowledgeItem } from '../types';

export const bookContent: BookSection[] = [
  {
    id: 'intro',
    title: 'El Cambio de Paradigma',
    subtitle: 'Módulo 01',
    readTime: '4 min',
    textParts: [
      { type: 'text', content: 'Durante décadas, la narrativa fue estética. Nos dijeron que el músculo era vanidad. Pero la ciencia actual revela una verdad tectónica: El ' },
      { type: 'keyword', content: 'músculo esquelético', id: 'skeletal_muscle' },
      { type: 'text', content: ' es el órgano endocrino más grande de tu cuerpo. No es tejido inerte; es un sistema de comunicación biológico que regula tu cerebro, hígado y huesos.' },
      { type: 'insight', content: 'El músculo no es opcional. Es un imperativo evolutivo para tu supervivencia.' }
    ],
    visualType: 'network'
  },
  {
    id: 'myokines',
    title: 'La Farmacia Interna',
    subtitle: 'Módulo 02',
    readTime: '6 min',
    textParts: [
      { type: 'text', content: 'Al contraerse, tus fibras musculares liberan ' },
      { type: 'keyword', content: 'Mioquinas', id: 'myokines' },
      { type: 'text', content: '. Son mensajeros moleculares con una potencia farmacológica superior a cualquier píldora. La ' },
      { type: 'keyword', content: 'Irisina', id: 'irisin' },
      { type: 'text', content: ' convierte grasa blanca en energía térmica, mientras que el ' },
      { type: 'keyword', content: 'BDNF', id: 'bdnf' },
      { type: 'text', content: ' actúa como fertilizante neuronal.' }
    ],
    visualType: 'particles'
  },
  {
    id: 'longevity',
    title: 'Tu Futuro Biológico',
    subtitle: 'Módulo 03',
    readTime: '5 min',
    textParts: [
      { type: 'text', content: 'Sarcopenia (pérdida de masa) y Dinapenia (pérdida de fuerza). Dos jinetes silenciosos. La ' },
      { type: 'keyword', content: 'fuerza de agarre', id: 'grip_strength' },
      { type: 'text', content: ' predice la mortalidad con mayor precisión que la presión arterial. ¿Cómo se ve tu trayectoria actual?' }
    ],
    visualType: 'simulation'
  }
];

export const agentKnowledgeBase: Record<string, AgentKnowledgeItem> = {
  skeletal_muscle: {
    title: "El Órgano Secreto",
    body: "El músculo secreta más de 600 tipos de mioquinas. Al hacer clic aquí, acabas de aprender que el músculo 'habla'.",
    action: "Explorar conexión Músculo-Cerebro"
  },
  myokines: {
    title: "Tu Farmacia Personal",
    body: "Las mioquinas son proteínas antiinflamatorias. Solo se liberan con la contracción mecánica.",
    action: "Ver protocolo de activación"
  },
  irisin: {
    title: "El Quemador Natural",
    body: "La Irisina convierte grasa blanca en parda. Se activa principalmente con ejercicio de alta intensidad.",
    action: "¿Cómo aumentar mi Irisina?"
  },
  bdnf: {
    title: "Neuroplasticidad",
    body: "El BDNF protege tus neuronas. El ejercicio de fuerza eleva el BDNF más que los crucigramas.",
    action: "Rutina para el cerebro"
  },
  grip_strength: {
    title: "Biomarcador #1",
    body: "Si no puedes colgarte de una barra por 30 segundos, tu riesgo de mortalidad aumenta.",
    action: "Test de Agarre NGX"
  }
};
