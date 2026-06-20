import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Persona, ChatThread, ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

export type Screen = 
  | { name: 'list' }
  | { name: 'chat', chatId: string }
  | { name: 'personas' }
  | { name: 'persona_editor', personaId?: string } // if undefined, creating new
  | { name: 'group_creator' }
  | { name: 'profile', personaId: string }; // clicking avatar triggers

interface AppState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  goBack: () => void;
  // History for stack
  screenHistory: Screen[];

  // Data
  personas: Persona[];
  chats: ChatThread[];
  messages: ChatMessage[];

  // Actions
  addPersona: (persona: Omit<Persona, 'id'>) => void;
  updatePersona: (id: string, updates: Partial<Persona>) => void;
  deletePersona: (id: string) => void;

  createPrivateChat: (personaId: string) => string; // returns chatId
  createGroupChat: (name: string, participantIds: string[]) => string;
  deleteChat: (id: string) => void;

  addMessage: (message: Omit<ChatMessage, 'id' | 'createdAt'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChatHistory: (chatId: string) => void;
}

const defaultPersonas: Persona[] = [
  {
    id: uuidv4(),
    name: 'Gojo Satoru',
    avatar: '😎',
    systemPrompt: 'You are Gojo Satoru from Jujutsu Kaisen. You are supremely confident, playful, and see yourself as the strongest sorcerer alive.',
    stylePrompt: 'Speak casually, use modern slang occasionally, and be slightly arrogant but caring towards allies.'
  },
  {
    id: uuidv4(),
    name: 'Sherlock Holmes',
    avatar: '🕵️',
    systemPrompt: 'You are Sherlock Holmes. You are highly observant, analytical, and socially detached.',
    stylePrompt: 'Speak formally with high vocabulary. Notice tiny details about others. Be slightly impatient with slow thinkers.'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      screen: { name: 'list' },
      screenHistory: [],
      
      setScreen: (screen) => set((state) => ({
        screen,
        screenHistory: [...state.screenHistory, state.screen]
      })),

      goBack: () => set((state) => {
        const history = [...state.screenHistory];
        history.pop(); // remove current
        const previous = history[history.length - 1] || { name: 'list' };
        return {
          screen: previous,
          screenHistory: history
        };
      }),

      personas: defaultPersonas,
      chats: [],
      messages: [],

      addPersona: (p) => set((state) => ({
        personas: [...state.personas, { ...p, id: uuidv4() }]
      })),

      updatePersona: (id, updates) => set((state) => ({
        personas: state.personas.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      deletePersona: (id) => set((state) => ({
        personas: state.personas.filter(p => p.id !== id),
        // cleanup related private chats
        chats: state.chats.filter(c => !(c.type === 'private' && c.participants.includes(id)))
      })),

      createPrivateChat: (personaId) => {
        const state = get();
        const existing = state.chats.find(c => c.type === 'private' && c.participants.includes(personaId));
        if (existing) return existing.id;

        const newChat: ChatThread = {
          id: uuidv4(),
          type: 'private',
          name: '', // dynamic based on persona
          participants: [personaId],
          updatedAt: Date.now()
        };
        set({ chats: [newChat, ...state.chats] });
        return newChat.id;
      },

      createGroupChat: (name, participantIds) => {
        const newChat: ChatThread = {
          id: uuidv4(),
          type: 'group',
          name,
          avatar: '👥',
          participants: participantIds,
          updatedAt: Date.now()
        };
        set((state) => ({ chats: [newChat, ...state.chats] }));
        return newChat.id;
      },

      deleteChat: (id) => set((state) => ({
        chats: state.chats.filter(c => c.id !== id),
        messages: state.messages.filter(m => m.chatId !== id)
      })),

      addMessage: (m) => {
        const msg: ChatMessage = {
          ...m,
          id: uuidv4(),
          createdAt: Date.now()
        };
        set((state) => ({
          messages: [...state.messages, msg],
          chats: state.chats.map(c => 
            c.id === m.chatId 
              ? { ...c, lastMessage: msg.text, updatedAt: msg.createdAt } 
              : c
          ).sort((a, b) => b.updatedAt - a.updatedAt)
        }));
        return msg.id;
      },

      updateMessage: (id, updates) => set((state) => ({
        messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
      })),

      clearChatHistory: (chatId) => set((state) => ({
        messages: state.messages.filter(m => m.chatId !== chatId)
      }))
    }),
    {
      name: 'cosplay-agent-storage',
      // Don't persist screen state so refresh goes home, or choose to persist it
      partialize: (state) => ({
        personas: state.personas,
        chats: state.chats,
        messages: state.messages
      }),
    }
  )
);
