import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  BookOpen, 
  FileText, 
  FileCode, 
  Star, 
  MoreVertical, 
  Trash2, 
  RotateCcw, 
  Folder, 
  ExternalLink,
  Edit2,
  Calendar,
  Clock
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';

export const NoteCard = ({ note, viewMode = 'grid' }) => {
  const { 
    setCurrentNote, 
    toggleFavorite, 
    deleteNote, 
    restoreNote, 
    updateNote, 
    activeFilter,
    folders 
  } = useNotesStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      updateNote(note._id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'whiteboard': return PenTool;
      case 'notebook': return BookOpen;
      case 'pdf': return FileText;
      case 'card_set': return FileCode;
      default: return PenTool;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'whiteboard': return { label: 'Whiteboard', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'notebook': return { label: 'Notebook', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'pdf': return { label: 'PDF Note', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'card_set': return { label: 'Card Set', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      default: return { label: 'Note', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  const Icon = getTypeIcon(note.type);
  const badge = getTypeBadge(note.type);
  const folder = folders.find(f => f._id === note.folderId);
  const isTrash = note.isDeleted || activeFilter === 'trash';

  // Format relative time
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={() => !isEditingTitle && !isTrash && setCurrentNote(note)}
        className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#131622] hover:bg-[#181c2b] border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  autoFocus
                  className="px-2 py-1 bg-slate-900 border border-indigo-500 rounded-lg text-sm text-white focus:outline-none"
                />
              </form>
            ) : (
              <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                {note.title}
              </h4>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg}`}>
                {badge.label}
              </span>
              {folder && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
                  {folder.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(note.updatedAt)}
          </span>

          {!isTrash && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(note._id);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-400 transition-colors"
            >
              <Star className={`w-4 h-4 ${note.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
            </button>
          )}

          {isTrash ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => restoreNote(note._id)}
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                title="Restore Note"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteNote(note._id)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Permanently Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNote(note._id);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div 
      onClick={() => !isEditingTitle && !isTrash && setCurrentNote(note)}
      className="group relative flex flex-col rounded-2xl bg-[#131622] hover:bg-[#181c2b] border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-200 overflow-hidden cursor-pointer shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 select-none"
    >
      {/* Thumbnail Canvas Area Preview */}
      <div 
        className="h-36 w-full relative flex items-center justify-center overflow-hidden border-b border-slate-800/80"
        style={{
          backgroundColor: note.backgroundSettings?.backgroundColor || '#12141c',
          backgroundImage: note.backgroundSettings?.template === 'grid' 
            ? `radial-gradient(circle, ${note.backgroundSettings?.gridColor || '#262a3b'} 1px, transparent 1px)`
            : note.backgroundSettings?.template === 'dots'
            ? `radial-gradient(circle, ${note.backgroundSettings?.gridColor || '#262a3b'} 1.5px, transparent 1.5px)`
            : 'none',
          backgroundSize: '16px 16px'
        }}
      >
        {note.thumbnail ? (
          <img src={note.thumbnail} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-80 transition-opacity">
            <Icon className="w-10 h-10 text-indigo-400" />
            <span className="text-[11px] font-mono text-slate-400">Interactive Canvas</span>
          </div>
        )}

        {/* Favorite Button Overlay */}
        {!isTrash && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(note._id);
            }}
            className="absolute top-3 left-3 p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-amber-400 transition-colors border border-slate-700/60"
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
          </button>
        )}

        {/* Context Menu Trigger */}
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white transition-colors border border-slate-700/60"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-44 py-1.5 rounded-xl glass-dropdown z-30 text-xs text-slate-300"
            >
              {!isTrash && (
                <>
                  <button
                    onClick={() => {
                      setIsEditingTitle(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentNote(note);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-left"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {note.type === 'notebook'
                        ? 'Open Notebook'
                        : note.type === 'pdf'
                        ? 'Open PDF Studio'
                        : note.type === 'card_set'
                        ? 'Open Flashcards'
                        : 'Open Whiteboard'}
                    </span>
                  </button>
                </>
              )}
              {isTrash ? (
                <>
                  <button
                    onClick={() => {
                      restoreNote(note._id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-emerald-400 text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Note</span>
                  </button>
                  <button
                    onClick={() => {
                      deleteNote(note._id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-rose-400 text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Forever</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    deleteNote(note._id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800 text-rose-400 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                autoFocus
                className="w-full px-2 py-1 bg-slate-900 border border-indigo-500 rounded-lg text-sm text-white focus:outline-none"
              />
            </form>
          ) : (
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
              {note.title}
            </h3>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg}`}>
              {badge.label}
            </span>
            {folder && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                <span className="truncate">{folder.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
          <span>Updated {formatDate(note.updatedAt)}</span>
          <span className="group-hover:text-indigo-400 transition-colors">Open →</span>
        </div>
      </div>
    </div>
  );
};
