import React from 'react';
import { ManagePersonas, PersonaEditor } from './ManagePersonas';
import { GroupCreator } from './GroupCreator';
import { MobileContainer } from '../components/MobileContainer';
import { useAppStore } from '../store';
import { ChatList } from './ChatList';
import { ChatRoom } from './ChatRoom';

export default function App() {
  const { screen } = useAppStore();

  const renderScreen = () => {
    switch (screen.name) {
      case 'list': return <ChatList />;
      case 'chat': return <ChatRoom chatId={screen.chatId} />;
      case 'personas': return <ManagePersonas />;
      case 'persona_editor': return <PersonaEditor personaId={screen.personaId} />;
      case 'group_creator': return <GroupCreator />;
      default: return <ChatList />;
    }
  };

  return (
    <MobileContainer>
      {renderScreen()}
    </MobileContainer>
  );
}
