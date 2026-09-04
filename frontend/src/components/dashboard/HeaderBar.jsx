import React from 'react';
import { 
  Search, 
  Plus, 
  Upload, 
  PenTool, 
  FileText, 
  BookOpen, 
  FileCode,
  Sparkles,
  Settings,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SortLayoutDropdown } from './SortLayoutDropdown';

export const HeaderBar = () => {
  const {
    activeFilter,
    activeFolderId,
    folders,
    searchQuery,
    setSearchQuery,
    setNewNoteModalOpen,
    createNote,
  } = useNotesStore();

  const { setSettingsOpen } = useAuthStore();

  const getHeaderTitle = () => {
    if (activeFolderId) {
      const folder = folders.find(f => f._id === activeFolderId);
      return folder ? folder.name : 'Folder Notes';
    }
    switch (activeFilter) {
      case 'whiteboard': return 'Whiteboards';
      case 'notebook': return 'Notebooks';
      case 'pdf': return 'PDF Annotations';
      case 'card_set': return 'Card Sets';
      case 'favorites': return 'Favorite Workspaces';
      case 'unsorted': return 'Unsorted Files';
      case 'trash': return 'Recently Deleted';
      default: return 'All Notes';
    }
  };

  const handleCreateSpecific = (type) => {
    const defaultTitles = {
      whiteboard: 'Untitled Whiteboard',
      notebook: 'Untitled Notebook',
      pdf: 'Untitled PDF Document.pdf',
      card_set: 'Untitled Flashcards Deck',
    };
    createNote({
      type,
      title: defaultTitles[type] || 'Untitled Note',
    });
  };

  const getButtonConfig = () => {
    switch (activeFilter) {
      case 'whiteboard':
        return {
          label: 'New Whiteboard',
          icon: PenTool,
          color: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
          action: () => handleCreateSpecific('whiteboard'),
        };
      case 'notebook':
        return {
          label: 'New Notebook',
          icon: BookOpen,
          color: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
          action: () => handleCreateSpecific('notebook'),
        };
      case 'pdf':
        return {
          label: 'New PDF Document',
          icon: FileText,
          color: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
          action: () => handleCreateSpecific('pdf'),
        };
      case 'card_set':
        return {
          label: 'New Card Set',
          icon: FileCode,
          color: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30',
          action: () => handleCreateSpecific('card_set'),
        };
      default:
        return {
          label: 'New Note',
          icon: Plus,
          color: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
          action: () => setNewNoteModalOpen(true),
        };
    }
  };

  const btnConfig = getButtonConfig();
  const Icon = btnConfig.icon;

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-[#0e111a]/90 backdrop-blur-md sticky top-0 z-20 select-none">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* Middle Search Bar */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title or tags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3">
        <SortLayoutDropdown />

        {/* Dynamic Context-Aware New Note Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={btnConfig.action}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${btnConfig.color}`}
          >
            <Icon className="w-4 h-4" />
            <span>{btnConfig.label}</span>
          </button>

          {/* Quick Settings Action Trigger */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
            title="Settings & Subscription Plans"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
