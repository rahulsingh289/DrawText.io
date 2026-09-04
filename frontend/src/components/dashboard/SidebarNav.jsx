import React, { useState } from 'react';
import { 
  Folder, 
  FolderPlus, 
  FileText, 
  PenTool, 
  BookOpen, 
  FileCode, 
  Layers, 
  Star, 
  Trash2, 
  HelpCircle, 
  Sparkles, 
  Settings, 
  ChevronRight,
  ChevronDown,
  Plus,
  Compass,
  LogOut,
  Crown
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { DrawTextLogo } from '../common/DrawTextLogo';

export const SidebarNav = () => {
  const { 
    activeFilter, 
    activeFolderId, 
    folders, 
    setActiveFilter, 
    setActiveFolderId, 
    createFolder, 
    deleteFolder,
    createNote,
    notes 
  } = useNotesStore();

  const { user, setSettingsOpen } = useAuthStore();
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolderColor, setSelectedFolderColor] = useState('#6366f1');
  const [isFoldersExpanded, setFoldersExpanded] = useState(true);

  // Compute counts
  const getFilterCount = (filterKey) => {
    if (filterKey === 'all') return notes.filter(n => !n.isDeleted).length;
    if (filterKey === 'favorites') return notes.filter(n => n.isFavorite && !n.isDeleted).length;
    if (filterKey === 'unsorted') return notes.filter(n => !n.folderId && !n.isDeleted).length;
    if (filterKey === 'trash') return notes.filter(n => n.isDeleted).length;
    return notes.filter(n => n.type === filterKey && !n.isDeleted).length;
  };

  const navItems = [
    { 
      id: 'all', 
      label: 'All Notes', 
      icon: Layers,
      createType: null,
    },
    { 
      id: 'whiteboard', 
      label: 'Whiteboard', 
      icon: PenTool,
      createType: 'whiteboard',
      createTitle: 'Untitled Whiteboard',
      color: 'text-indigo-400',
    },
    { 
      id: 'notebook', 
      label: 'Notebook', 
      icon: BookOpen,
      createType: 'notebook',
      createTitle: 'Untitled Notebook',
      color: 'text-emerald-400',
    },
    { 
      id: 'pdf', 
      label: 'PDF Annotations', 
      icon: FileText,
      createType: 'pdf',
      createTitle: 'Untitled PDF Document.pdf',
      color: 'text-rose-400',
    },
    { 
      id: 'card_set', 
      label: 'Card Set', 
      icon: FileCode,
      createType: 'card_set',
      createTitle: 'Untitled Flashcards Deck',
      color: 'text-amber-400',
    },
  ];

  const bottomNavItems = [
    { id: 'favorites', label: 'Favorites', icon: Star, color: 'text-amber-400' },
    { id: 'unsorted', label: 'Unsorted', icon: Folder },
    { id: 'trash', label: 'Recently Deleted', icon: Trash2, color: 'text-rose-400' },
  ];

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), selectedFolderColor);
    setNewFolderName('');
    setFolderModalOpen(false);
  };

  const handleQuickCreateType = (e, item) => {
    e.stopPropagation();
    if (item.createType) {
      createNote({
        title: item.createTitle,
        type: item.createType,
      });
    }
  };

  const FOLDER_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6'];

  return (
    <aside className="w-72 h-full flex flex-col bg-[#0e111a] border-r border-slate-800/80 select-none">
      {/* Brand & Logo Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <DrawTextLogo size={38} />
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              DrawText.io
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Infinite Workspace</p>
          </div>
        </div>
      </div>

      {/* Main Nav Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {/* Workspace Types Section */}
        <div>
          <div className="px-2 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFilter === item.id;
              const count = getFilterCount(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color || 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Direct Quick Create "+" Button on Hover */}
                    {item.createType && (
                      <button
                        onClick={(e) => handleQuickCreateType(e, item)}
                        className={`p-1 rounded-md opacity-0 group-hover:opacity-100 hover:scale-110 transition-all ${
                          isActive ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                        title={`Create New ${item.label}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-800/80 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Folders Section */}
        <div>
          <div className="px-2 pb-2 flex items-center justify-between">
            <button
              onClick={() => setFoldersExpanded(!isFoldersExpanded)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              {isFoldersExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Folders</span>
            </button>
            <button
              onClick={() => setFolderModalOpen(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
              title="Add New Folder"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {isFoldersExpanded && (
            <div className="space-y-1 mt-1">
              {folders.length === 0 ? (
                <div className="px-3 py-3 text-xs text-slate-400 text-center italic border border-dashed border-slate-800/80 rounded-xl">
                  No folders yet. Click + to create.
                </div>
              ) : (
                folders.map((folder) => {
                  const isActive = activeFolderId === folder._id;
                  return (
                    <div
                      key={folder._id}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-slate-800/90 text-white border border-slate-700/80'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                      }`}
                    >
                      <button
                        onClick={() => setActiveFolderId(folder._id)}
                        className="flex-1 flex items-center gap-2.5 truncate text-left"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: folder.color || '#6366f1' }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </button>
                      <span className="text-xs text-slate-400 font-mono px-1.5">
                        {notes.filter(n => n.folderId === folder._id && !n.isDeleted).length}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Collections / System Filters */}
        <div>
          <div className="px-2 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Collections
          </div>
          <div className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFilter === item.id;
              const count = getFilterCount(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.color || (isActive ? 'text-white' : 'text-slate-400')}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800/80 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer Profile & Settings Trigger */}
      <div className="p-3 border-t border-slate-800/60 bg-[#0b0e16]/80">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all">
          <div 
            className="flex items-center gap-3 truncate cursor-pointer flex-1" 
            onClick={() => setSettingsOpen(true)}
            title="Open Settings & Subscription Plans"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/40"
            />
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name || 'Rahul Singh'}</p>
              <p className="text-[11px] text-indigo-400 font-medium truncate flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" />
                {user?.accountStatus || 'Pro Member'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors"
              title="Settings & Subscription Plans"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
            </button>
            <button
              onClick={() => useAuthStore.getState().logout()}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-[#141824] border border-slate-700/80 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create Folder</h3>
            <p className="text-xs text-slate-400 mb-4">Organize your whiteboards and notes into dedicated spaces.</p>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Physics 101, Project Alpha"
                  autoFocus
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Folder Accent Color</label>
                <div className="flex items-center gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedFolderColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        selectedFolderColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
