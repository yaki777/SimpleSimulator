export interface Persona {
  id: string;
  name: string;
  avatar: string; // Emoji or URL
  systemPrompt: string;
  stylePrompt: string;
  defaultModel?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string; // 'user' or personaId
  senderName: string;
  text: string;
  createdAt: number;
  isPending?: boolean;
}

export interface ChatThread {
  id: string;
  type: 'group' | 'private';
  name: string; // For group chat name or derived from persona
  avatar?: string;
  participants: string[]; // personaIds
  lastMessage?: string;
  updatedAt: number;
}
