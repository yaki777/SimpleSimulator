import { ChatMessage, Persona } from './types';

export async function generateAiReply(
  persona: Persona,
  messagesHistory: ChatMessage[],
  allPersonas: Persona[]
): Promise<string> {
  // Format history for the API
  const formattedMessages = messagesHistory.map(m => {
    if (m.senderId === persona.id) {
      return { role: 'assistant', content: m.text };
    }
    // For other senders (user or other bots in group chat)
    // We prepend their name so this Persona knows who said what.
    const sender = m.senderId === 'user' ? 'User' : m.senderName;
    return { role: 'user', content: `[${sender} says]: ${m.text}` };
  });

  const fullSystemPrompt = `${persona.systemPrompt}\n\n${persona.stylePrompt}\n\nImportant: Do not prefix your reply with your own name. Simply respond in character.`;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemPrompt: fullSystemPrompt,
      messages: formattedMessages,
      model: persona.defaultModel || 'google/gemini-2.5-flash'
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.reply;
}
