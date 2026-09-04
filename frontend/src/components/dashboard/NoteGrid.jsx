import React from 'react';
import { useNotesStore } from '../../store/useNotesStore';
import { NoteCard } from './NoteCard';
import { PenTool, Plus, FolderOpen, BookOpen, FileText, FileCode, Sparkles } from 'lucide-react';

export const NoteGrid = () => {
  const { notes, viewMode, activeFilter, activeFolderId, folders, searchQuery, setNewNoteModalOpen, createNote } = useNotesStore();

  // Filter notes based on activeFilter, folderId, and searchQuery
  const filteredNotes = notes.filter((note) => {
    // Trash filter check
    if (activeFilter === 'trash') {
      if (!note.isDeleted) return false;
    } else {
      if (note.isDeleted) return false;

      if (activeFilter === 'favorites' && !note.isFavorite) return false;
      if (activeFilter === 'unsorted' && note.folderId) return false;
      if (activeFilter === 'folder' && activeFolderId && note.folderId !== activeFolderId) return false;
      if (['whiteboard', 'notebook', 'pdf', 'card_set'].includes(activeFilter) && note.type !== activeFilter) return false;
    }

    // Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = note.title?.toLowerCase().includes(q);
      const matchTags = note.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchTags) return false;
    }

    return true;
  });

  const getEmptyButtonConfig = () => {
    switch (activeFilter) {
      case 'whiteboard':
        return {
          label: 'Create New Whiteboard',
          icon: PenTool,
          color: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
          action: () => createNote({ type: 'whiteboard', title: 'Untitled Whiteboard' }),
        };
      case 'notebook':
        return {
          label: 'Create New Notebook',
          icon: BookOpen,
          color: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30',
          action: () => createNote({ type: 'notebook', title: 'Untitled Notebook' }),
        };
      case 'pdf':
        return {
          label: 'Create New PDF Document',
          icon: FileText,
          color: 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30',
          action: () => createNote({ type: 'pdf', title: 'Untitled PDF Document.pdf' }),
        };
      case 'card_set':
        return {
          label: 'Create New Flashcard Deck',
          icon: FileCode,
          color: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30',
          action: () => createNote({ type: 'card_set', title: 'Untitled Flashcard Deck' }),
        };
      default:
        return {
          label: 'Create New Workspace',
          icon: Plus,
          color: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30',
          action: () => setNewNoteModalOpen(true),
        };
    }
  };

  const emptyBtn = getEmptyButtonConfig();
  const EmptyIcon = emptyBtn.icon;

  if (filteredNotes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4 text-indigo-400 shadow-inner">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-200 mb-1">
          {searchQuery ? 'No matching workspaces found' : 'No notes in this view yet'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          {searchQuery
            ? `We couldn't find anything matching "${searchQuery}". Try a different keyword.`
            : activeFilter === 'trash'
            ? 'Your trash is clean and empty.'
            : activeFilter === 'whiteboard'
            ? 'Create an infinite vector whiteboard for ideas, flows, and sketches.'
            : activeFilter === 'notebook'
            ? 'Create a multi-page digital notebook for study notes and summaries.'
            : activeFilter === 'pdf'
            ? 'Import and annotate research papers, lecture slides, and PDF documents.'
            : activeFilter === 'card_set'
            ? 'Create interactive concept flashcard decks for 3D study and review.'
            : 'Create a new whiteboard, notebook, or import documents to get started.'}
        </p>

        {activeFilter !== 'trash' && !searchQuery && (
          <button
            onClick={emptyBtn.action}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform active:scale-95 ${emptyBtn.color}`}
          >
            <EmptyIcon className="w-4 h-4" />
            <span>{emptyBtn.label}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard key={note._id} note={note} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-2.5">
          {filteredNotes.map((note) => (
            <NoteCard key={note._id} note={note} viewMode="list" />
          ))}
        </div>
      )}
    </div>
  );
};
