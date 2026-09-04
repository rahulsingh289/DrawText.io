import React, { useEffect } from 'react';
import { SidebarNav } from './components/dashboard/SidebarNav';
import { HeaderBar } from './components/dashboard/HeaderBar';
import { NoteGrid } from './components/dashboard/NoteGrid';
import { NewNoteModal } from './components/dashboard/NewNoteModal';
import { WhiteboardEditor } from './components/canvas/WhiteboardEditor';
import { NotebookEditor } from './components/notebook/NotebookEditor';
import { PdfAnnotator } from './components/pdf/PdfAnnotator';
import { CardSetEditor } from './components/cardset/CardSetEditor';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { useNotesStore } from './store/useNotesStore';
import { useAuthStore } from './store/useAuthStore';

export function App() {
  const { currentNote, fetchNotes, fetchFolders } = useNotesStore();
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
      fetchNotes();
      fetchFolders();
    }
  }, [isAuthenticated]);

  // 1. If not logged in, render the Auth Screen (Sign in / Sign up)
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Render active workspace or main dashboard
  const renderWorkspace = () => {
    if (!currentNote) {
      return (
        <div className="w-screen h-screen flex bg-[#0b0d14] overflow-hidden">
          <SidebarNav />
          <main className="flex-1 flex flex-col h-full overflow-hidden">
            <HeaderBar />
            <NoteGrid />
          </main>
          <NewNoteModal />
        </div>
      );
    }

    switch (currentNote.type) {
      case 'notebook':
        return <NotebookEditor />;
      case 'pdf':
        return <PdfAnnotator />;
      case 'card_set':
        return <CardSetEditor />;
      case 'whiteboard':
      default:
        return <WhiteboardEditor />;
    }
  };

  return (
    <div className="w-screen h-screen relative bg-[#0b0d14] overflow-hidden">
      {renderWorkspace()}
      {/* Settings & Tier Subscription Modal available globally */}
      <SettingsModal />
    </div>
  );
}

export default App;
