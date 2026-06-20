import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { ChevronLeft, Send, Sparkles, User, Loader2, Download } from 'lucide-react';
import { generateAiReply } from '../api';
import { Persona } from '../types';

export function ChatRoom({ chatId }: { chatId: string }) {
  const { chats, messages, personas, goBack, addMessage, updateMessage, setScreen } = useAppStore();
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = chats.find(c => c.id === chatId);
  const chatMessages = messages.filter(m => m.chatId === chatId);
  const participants = personas.filter(p => chat?.participants.includes(p.id));

  const isGroup = chat?.type === 'group';
  const headerName = isGroup ? chat.name : (participants[0]?.name || 'Unknown');
  const headerAvatar = isGroup ? (chat.avatar || '👥') : (participants[0]?.avatar || '👤');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!chat) return <div className="p-4">Chat not found</div>;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    addMessage({
      chatId,
      senderId: 'user',
      senderName: 'You',
      text: inputText.trim()
    });
    
    setInputText('');
  };

  const handleTriggerAi = async (persona: Persona) => {
    if (isGenerating) return;
    setIsGenerating(true);

    const tempId = addMessage({
      chatId,
      senderId: persona.id,
      senderName: persona.name,
      text: '',
      isPending: true
    });

    try {
      const history = messages.filter(m => m.chatId === chatId);
      const reply = await generateAiReply(persona, history, personas);
      
      updateMessage(tempId, { text: reply, isPending: false });
    } catch (err: any) {
      updateMessage(tempId, { 
        text: `[Error generating reply: ${err.message}]`, 
        isPending: false 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = () => {
    const textBlob = chatMessages.map(m => `[${m.senderName}]: ${m.text}`).join('\n\n');
    const blob = new Blob([textBlob], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${headerName.replace(/\\s+/g, '_')}_chat.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#7391A4] relative">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center">
          <button onClick={goBack} className="text-[#24A1DE] mx-1 p-2 rounded-full hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl overflow-hidden border">
              {headerAvatar.startsWith('http') ? <img src={headerAvatar} className="w-full h-full object-cover"/> : headerAvatar}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 leading-tight">{headerName}</h2>
              <p className="text-xs text-gray-500">
                {isGroup ? `${participants.length} AI members` : 'AI Persona'}
              </p>
            </div>
          </div>
        </div>
        <button onClick={handleExport} className="text-[#24A1DE] p-2 hover:bg-blue-50 rounded-full" title="Export Chat History">
          <Download className="w-5 h-5" />
        </button>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p>No messages yet. Say hi!</p>
          </div>
        )}
        
        {chatMessages.map(msg => {
          const isUser = msg.senderId === 'user';
          const senderPersona = isUser ? null : personas.find(p => p.id === msg.senderId);

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {!isUser && isGroup && (
                <div 
                  className="w-8 h-8 rounded-full bg-gray-200 mr-2 shrink-0 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-transform"
                  onClick={() => setScreen({ name: 'profile', personaId: msg.senderId })}
                >
                  {senderPersona?.avatar?.startsWith('http') ? (
                    <img src={senderPersona.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm">{senderPersona?.avatar || '🤖'}</span>
                  )}
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                {!isUser && isGroup && (
                  <span className="text-xs text-[#24A1DE] font-bold ml-1 mb-1">{senderPersona?.name || msg.senderName}</span>
                )}
                <div 
                  className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                    isUser 
                      ? 'bg-[#EFFDDE] text-gray-800 rounded-br-none' 
                      : 'bg-white border-0 text-gray-900 rounded-bl-none'
                  }`}
                >
                  {msg.isPending ? (
                    <div className="flex items-center space-x-1.5 h-6">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-[15px] break-words">
                      {msg.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white p-3 shrink-0 flex flex-col items-stretch space-y-2">
        {/* Ai reply triggers for group */}
        {participants.length > 0 && (
          <div className="mb-2 flex overflow-x-auto space-x-2 px-2 no-scrollbar">
            {participants.map(p => (
              <button 
                key={p.id}
                onClick={() => handleTriggerAi(p)}
                disabled={isGenerating}
                className="flex items-center bg-white px-3 py-1.5 shadow-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50 whitespace-nowrap"
              >
                <div className="w-4 h-4 mr-1.5 flex items-center justify-center text-xs">
                  {p.avatar.startsWith('http') ? <img src={p.avatar} className="w-full h-full rounded-full" /> : p.avatar}
                </div>
                Ask {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end bg-gray-100 border border-gray-200 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-[#24A1DE] focus-within:border-transparent transition-shadow pl-4 pr-1 py-1">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message..."
            className="flex-1 max-h-32 min-h-[40px] py-2 outline-none resize-none bg-transparent"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="mb-1 ml-2 w-9 h-9 flex items-center justify-center bg-[#24A1DE] text-white rounded-full disabled:bg-gray-300 disabled:text-gray-500 shrink-0 transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
      
      {/* Profile Modal Layer */}
      <ProfileOverlay />
    </div>
  );
}

function ProfileOverlay() {
  const { screen, personas, createPrivateChat, setScreen, goBack } = useAppStore();
  if (screen.name !== 'profile') return null;

  const persona = personas.find(p => p.id === screen.personaId);
  if (!persona) return null;

  const handleMessage = () => {
    const chatId = createPrivateChat(persona.id);
    // Replace stack
    setScreen({ name: 'chat', chatId });
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end justify-center sm:items-center">
      <div className="bg-white w-full sm:w-[90%] sm:rounded-3xl rounded-t-3xl overflow-hidden animate-in slide-in-from-bottom flex flex-col max-h-[80%]">
        <div className="p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-4xl mb-4 border-2 border-gray-200">
            {persona.avatar.startsWith('http') ? <img src={persona.avatar} className="w-full h-full object-cover" /> : persona.avatar}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{persona.name}</h2>
          <p className="text-gray-500 text-sm mb-6 text-center line-clamp-3">{persona.systemPrompt}</p>

          <button 
            onClick={handleMessage}
            className="w-full py-3.5 bg-[#24A1DE] text-white font-semibold rounded-xl hover:bg-[#1a88bd] transition-colors"
          >
            Send Message
          </button>
          
          <button 
            onClick={goBack}
            className="w-full py-3.5 text-gray-500 font-medium mt-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
