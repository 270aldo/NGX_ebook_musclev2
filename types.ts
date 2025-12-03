
export interface Insight {
  text: string;
  module: string;
}

export type VisualType = 'network' | 'particles' | 'simulation';

export interface TextPart {
  type: 'text' | 'keyword' | 'insight';
  content: string;
  id?: string;
}

export interface BookSection {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  textParts: TextPart[];
  visualType: VisualType;
}

export interface AgentKnowledgeItem {
  title: string;
  body: string;
  action: string;
}

export type ChatRole = 'user' | 'agent';
export type ChatType = 'text' | 'card' | 'image' | 'error';

export interface ChatMessage {
  role: ChatRole;
  type: ChatType;
  content?: string;
  title?: string; // For card type
  body?: string;  // For card type
  action?: string; // For card type
  imageData?: string; // Base64 image data
  mimeType?: string; // Image mime type (e.g., image/jpeg)
}
