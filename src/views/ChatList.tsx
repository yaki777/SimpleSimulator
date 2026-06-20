import React, { useMemo } from 'react';
import { useAppStore } from '../store';
import { Settings, Users, MessageCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';

export function ChatList() {
  const { chats, messages, personas, setScreen } = useAppStore();

  const getChatPreview = (chatId: string) => {
    const chatMessages = messages.filter(m => m.chatId === chatId);
    if (chatMessages.length === 0) return 'No messages yet...';
    return chatMessages[chatMessages.length - 1].text;
  };

  const getChatInfo = (chat: typeof chats[0]) => {
    if (chat.type === 'group') {
      return {
        name: chat.name,
        avatar: chat.avatar || '👥',
        isGroup: true
      };
    } else {
      const persona = personas.find(p => p.id === chat.participants[0]);
      return {
        name: persona?.name || 'Unknown',
        avatar: persona?.avatar || '👤',
        isGroup: false
      };
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#24A1DE] rounded-full flex items-center justify-center text-white">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h1 className="font-semibold text-lg text-gray-900">EchoWorlds</h1>
        </div>
        <button onClick={() => setScreen({ name: 'personas' })} className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 px-8 text-center">
            <MessageCircle className="w-16 h-16 opacity-20" />
            <p className="text-lg font-medium text-gray-500">No chats yet</p>
            <p className="text-sm">Create a group chat or interact with a persona to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-[#F4F4F5]">
            {chats.map(chat => {
              const info = getChatInfo(chat);
              const preview = getChatPreview(chat.id);
              
              return (
                <div 
                  key={chat.id} 
                  onClick={() => setScreen({ name: 'chat', chatId: chat.id })}
                  className="flex items-center px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors bg-white border-l-4 border-transparent hover:border-[#24A1DE]"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-2xl shrink-0 mr-4 border">
                    {info.avatar.startsWith('http') ? <img src={info.avatar} className="w-full h-full object-cover"/> : info.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h2 className="font-semibold text-gray-900 truncate pr-2">{info.name}</h2>
                      <span className="text-xs text-gray-500 shrink-0">
                        {chat.updatedAt ? format(chat.updatedAt, 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{preview}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button 
        onClick={() => setScreen({ name: 'group_creator' })}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#24A1DE] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#1a88bd] transition-transform active:scale-95"
      >
        <Edit className="w-6 h-6" />
      </button>
    </div>
  );
}
