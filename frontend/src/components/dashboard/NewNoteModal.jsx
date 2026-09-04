import React, { useState } from 'react';
import { 
  X, 
  PenTool, 
  BookOpen, 
  FileText, 
  FileCode, 
  Grid, 
  AlignLeft, 
  CircleDot, 
  Square,
  Sparkles,
  Folder
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';

export const NewNoteModal = () => {
  const { isNewNoteModalOpen, setNewNoteModalOpen, createNote, folders, activeFolderId, activeFilter } = useNotesStore();

  const [title, setTitle] = useState('');
  const [type, setType] = useState(
    ['whiteboard', 'notebook', 'pdf', 'card_set'].includes(activeFilter) ? activeFilter : 'whiteboard'
  );
  const [folderId, setFolderId] = useState(activeFolderId || '');
  const [template, setTemplate] = useState('grid');
  const [backgroundColor, setBackgroundColor] = useState('#12141c');
  const [gridColor, setGridColor] = useState('#262a3b');

  React.useEffect(() => {
    if (isNewNoteModalOpen) {
      setType(['whiteboard', 'notebook', 'pdf', 'card_set'].includes(activeFilter) ? activeFilter : 'whiteboard');
      setFolderId(activeFolderId || '');
    }
  }, [isNewNoteModalOpen, activeFilter, activeFolderId]);

  if (!isNewNoteModalOpen) return null;

  const noteTypes = [
    { id: 'whiteboard', label: 'Whiteboard', icon: PenTool, desc: 'Infinite vector canvas for sketching & flows' },
    { id: 'notebook', label: 'Notebook', icon: BookOpen, desc: 'Structured pages for study & notes' },
    { id: 'pdf', label: 'PDF Document', icon: FileText, desc: 'Import and annotate documents' },
    { id: 'card_set', label: 'Card Set', icon: FileCode, desc: 'Visual flashcards & concept cards' },
  ];

  const templates = [
    { id: 'grid', label: 'Square Grid', icon: Grid },
    { id: 'dots', label: 'Dot Matrix', icon: CircleDot },
    { id: 'ruled', label: 'Ruled Lines', icon: AlignLeft },
    { id: 'blank', label: 'Blank Canvas', icon: Square },
  ];

  const bgColors = [
    { name: 'Dark Slate', hex: '#12141c', grid: '#262a3b' },
    { name: 'Midnight', hex: '#0b0d14', grid: '#1e2230' },
    { name: 'Deep Navy', hex: '#0f172a', grid: '#1e293b' },
    { name: 'Obsidian', hex: '#18181b', grid: '#27272a' },
    { name: 'Warm Cream', hex: '#fdfbf7', grid: '#e5e2dc' },
    { name: 'Light Studio', hex: '#ffffff', grid: '#e2e8f0' },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    await createNote({
      title: title.trim() || (type === 'whiteboard' ? 'Untitled Whiteboard' : 'Untitled Note'),
      type,
      folderId: folderId || null,
      backgroundSettings: {
        template,
        backgroundColor,
        gridColor,
        spacing: 'medium'
      }
    });
    setNewNoteModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-[#141824] border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Create New Workspace</h3>
          </div>
          <button
            onClick={() => setNewNoteModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {/* Note Title */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Design Diagram, Calculus Review"
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>

          {/* Note Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Workspace Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {noteTypes.map((nt) => {
                const Icon = nt.icon;
                const isSelected = type === nt.id;
                return (
                  <button
                    key={nt.id}
                    type="button"
                    onClick={() => setType(nt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">{nt.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{nt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Folder Assignment */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Folder
            </label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">No Folder (Unsorted)</option>
              {folders.map((f) => (
                <option key={f._id} value={f._id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Canvas Background Template */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Initial Paper / Grid Style
            </label>
            <div className="grid grid-cols-4 gap-2">
              {templates.map((t) => {
                const Icon = t.icon;
                const isSelected = template === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTemplate(t.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Color Swatches */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Background Color
            </label>
            <div className="flex items-center gap-3">
              {bgColors.map((bg) => (
                <button
                  key={bg.name}
                  type="button"
                  onClick={() => {
                    setBackgroundColor(bg.hex);
                    setGridColor(bg.grid);
                  }}
                  title={bg.name}
                  className={`w-7 h-7 rounded-full border transition-transform ${
                    backgroundColor === bg.hex
                      ? 'scale-125 border-indigo-400 ring-2 ring-indigo-500/50'
                      : 'border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: bg.hex }}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setNewNoteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
            >
              Create & Open Canvas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
