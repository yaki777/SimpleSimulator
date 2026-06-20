import React, { useState } from 'react';
import { useAppStore } from '../store';
import { ChevronLeft, UserPlus, Settings, Save, Trash2 } from 'lucide-react';
import { MobileContainer } from '../components/MobileContainer';
import { Persona } from '../types';

export function ManagePersonas() {
  const { personas, addPersona, updatePersona, deletePersona, goBack, setScreen } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white border-b px-4 py-3 flex items-center shrink-0">
        <button onClick={goBack} className="text-[#24A1DE] flex items-center font-medium">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <span className="font-semibold text-center flex-1 pr-6">AI Personas</span>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {personas.map(p => (
          <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-2xl border">
                {p.avatar.startsWith('http') ? <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" /> : p.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{p.systemPrompt}</p>
              </div>
            </div>
            <button 
              onClick={() => setScreen({ name: 'persona_editor', personaId: p.id })}
              className="px-3 py-1.5 text-sm bg-gray-50 text-[#24A1DE] font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
          </div>
        ))}

        <button 
          onClick={() => setScreen({ name: 'persona_editor' })}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 flex items-center justify-center space-x-2 font-medium hover:border-[#24A1DE] hover:text-[#24A1DE] transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span>Create New Persona</span>
        </button>
      </div>
    </div>
  );
}

export function PersonaEditor({ personaId }: { personaId?: string }) {
  const { personas, addPersona, updatePersona, deletePersona, goBack } = useAppStore();
  const existing = personaId ? personas.find(p => p.id === personaId) : null;
  
  const [formData, setFormData] = useState<Omit<Persona, 'id'>>({
    name: existing?.name || '',
    avatar: existing?.avatar || '🤖',
    systemPrompt: existing?.systemPrompt || '',
    stylePrompt: existing?.stylePrompt || '',
  });

  const handleSave = () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) return alert("Name and System Prompt required");
    if (existing) {
      updatePersona(existing.id, formData);
    } else {
      addPersona(formData);
    }
    goBack();
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <header className="border-b px-4 py-3 flex items-center justify-between shrink-0 bg-white z-10 sticky top-0">
        <button onClick={goBack} className="text-[#24A1DE] font-medium">Cancel</button>
        <span className="font-semibold">{existing ? 'Edit Persona' : 'New Persona'}</span>
        <button onClick={handleSave} className="text-[#24A1DE] font-bold focus:outline-none">Save</button>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-4xl border-2 border-gray-200">
              {formData.avatar.startsWith('http') ? <img src={formData.avatar} className="w-full h-full object-cover"/> : formData.avatar}
            </div>
            <input 
              type="text" 
              value={formData.avatar} 
              onChange={e => setFormData(f => ({...f, avatar: e.target.value}))}
              className="absolute -bottom-2 -right-2 w-10 h-10 border rounded-full bg-white shadow-sm text-center text-sm px-1 focus:ring-2 ring-[#24A1DE] outline-none"
              placeholder="Emoji"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData(f => ({...f, name: e.target.value}))}
              className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 border focus:bg-white focus:ring-2 ring-[#24A1DE] focus:border-transparent outline-none transition-all"
              placeholder="e.g. Sherlock Holmes"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System Prompt (Identity/Lore)</label>
            <textarea 
              value={formData.systemPrompt} 
              onChange={e => setFormData(f => ({...f, systemPrompt: e.target.value}))}
              className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 border focus:bg-white focus:ring-2 ring-[#24A1DE] focus:border-transparent outline-none transition-all resize-none h-32"
              placeholder="Describe who they are, their background, what they know..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Style Prompt (Rules/Tone)</label>
            <textarea 
              value={formData.stylePrompt} 
              onChange={e => setFormData(f => ({...f, stylePrompt: e.target.value}))}
              className="w-full border-gray-300 rounded-xl px-4 py-3 bg-gray-50 border focus:bg-white focus:ring-2 ring-[#24A1DE] focus:border-transparent outline-none transition-all resize-none h-24"
              placeholder="e.g. Speak formally, act impatient, use emoji"
            />
          </div>
        </div>

        {existing && (
          <button 
            onClick={() => {
              if(window.confirm('Delete this persona?')) {
                deletePersona(existing.id);
                goBack();
              }
            }}
            className="w-full py-3.5 mt-8 bg-red-50 text-red-600 font-semibold rounded-xl flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5"/>
            <span>Delete Persona</span>
          </button>
        )}
      </div>
    </div>
  );
}
