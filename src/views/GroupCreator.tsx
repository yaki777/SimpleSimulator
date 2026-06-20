import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ChevronLeft, Check } from 'lucide-react';

export function GroupCreator() {
  const { personas, createGroupChat, setScreen, goBack } = useAppStore();
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCreate = () => {
    if (!name.trim()) return alert("Please enter a group name");
    if (selectedIds.size === 0) return alert("Please select at least one AI persona");
    
    const chatId = createGroupChat(name.trim(), Array.from(selectedIds));
    setScreen({ name: 'chat', chatId });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center shrink-0">
        <button onClick={goBack} className="text-[#24A1DE] flex items-center font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" /> Cancel
        </button>
        <span className="font-semibold text-center flex-1">New Group</span>
        <button 
          onClick={handleCreate} 
          disabled={!name.trim() || selectedIds.size === 0}
          className="text-[#24A1DE] font-bold disabled:opacity-50"
        >
          Create
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-500 mb-2">Group Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full text-lg border-b-2 border-gray-200 focus:border-[#24A1DE] py-2 outline-none bg-transparent transition-colors"
            placeholder="e.g. Detective Club"
            autoFocus
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider px-2">Select Members</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {personas.map(p => {
              const isSelected = selectedIds.has(p.id);
              return (
                <div 
                  key={p.id} 
                  onClick={() => handleToggle(p.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-2xl border">
                      {p.avatar.startsWith('http') ? <img src={p.avatar} className="w-full h-full object-cover"/> : p.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-[#24A1DE] border-[#24A1DE]' : 'border-gray-300'}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
