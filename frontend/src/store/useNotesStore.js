import { create } from 'zustand';
import { api } from '../services/api';

export const useNotesStore = create((set, get) => ({
  notes: [],
  folders: [],
  currentNote: null,
  activeFilter: 'all', // 'all', 'whiteboard', 'notebook', 'pdf', 'card_set', 'favorites', 'unsorted', 'trash'
  activeFolderId: null,
  searchQuery: '',
  sortBy: 'updatedAt', // 'name', 'createdAt', 'updatedAt'
  sortOrder: 'desc', // 'asc' | 'desc'
  viewMode: 'grid', // 'grid' | 'list'
  isLoading: false,
  isNewNoteModalOpen: false,

  setNewNoteModalOpen: (isOpen) => set({ isNewNoteModalOpen: isOpen }),
  setActiveFilter: (filter) => set({ activeFilter: filter, activeFolderId: null }),
  setActiveFolderId: (folderId) => set({ activeFolderId: folderId, activeFilter: 'folder' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setViewMode: (viewMode) => set({ viewMode }),
  setCurrentNote: (note) => set({ currentNote: note }),

  fetchNotes: async () => {
    try {
      set({ isLoading: true });
      const { activeFilter, activeFolderId, searchQuery, sortBy, sortOrder } = get();
      
      const params = {
        search: searchQuery,
        sortBy,
        sortOrder,
      };

      if (activeFilter === 'trash') {
        params.isDeleted = 'true';
      } else {
        params.isDeleted = 'false';
        if (activeFilter === 'favorites') {
          params.isFavorite = 'true';
        } else if (activeFilter === 'unsorted') {
          params.folderId = '';
        } else if (activeFilter === 'folder' && activeFolderId) {
          params.folderId = activeFolderId;
        } else if (activeFilter !== 'all') {
          params.type = activeFilter;
        }
      }

      const res = await api.get('/notes', { params });
      if (res.data?.success && Array.isArray(res.data.data)) {
        set({ notes: res.data.data });
      }
    } catch (err) {
      console.warn('Backend fetch notes warning:', err?.message);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchFolders: async () => {
    try {
      const res = await api.get('/folders');
      if (res.data?.success && Array.isArray(res.data.data)) {
        set({ folders: res.data.data });
      }
    } catch (err) {
      console.warn('Backend fetch folders warning:', err?.message);
    }
  },

  createFolder: async (name, color = '#6366f1') => {
    try {
      const res = await api.post('/folders', { name, color });
      if (res.data?.success) {
        set((state) => ({ folders: [...state.folders, res.data.data] }));
        return res.data.data;
      }
    } catch (err) {
      const newFolder = {
        _id: `folder-${Date.now()}`,
        name,
        color,
        icon: 'Folder',
        notesCount: 0,
      };
      set((state) => ({ folders: [...state.folders, newFolder] }));
      return newFolder;
    }
  },

  deleteFolder: async (folderId) => {
    try {
      await api.delete(`/folders/${folderId}`);
    } catch (err) {}
    set((state) => ({
      folders: state.folders.filter((f) => f._id !== folderId),
      notes: state.notes.map((n) => (n.folderId === folderId ? { ...n, folderId: null } : n)),
      activeFolderId: state.activeFolderId === folderId ? null : state.activeFolderId,
      activeFilter: state.activeFolderId === folderId ? 'all' : state.activeFilter,
    }));
  },

  createNote: async ({ title, type = 'whiteboard', folderId = null, backgroundSettings }) => {
    const newNotePayload = {
      title: title || (type === 'whiteboard' ? 'Untitled Whiteboard' : 'Untitled Note'),
      type,
      folderId: folderId || get().activeFolderId || null,
      backgroundSettings: backgroundSettings || {
        template: 'grid',
        backgroundColor: '#12141c',
        gridColor: '#262a3b',
        spacing: 'medium',
      },
    };

    try {
      const res = await api.post('/notes', newNotePayload);
      if (res.data?.success) {
        const created = res.data.data;
        set((state) => ({
          notes: [created, ...state.notes],
          currentNote: created,
        }));
        return created;
      }
    } catch (err) {
      const localNote = {
        _id: `note-${Date.now()}`,
        ...newNotePayload,
        isFavorite: false,
        isDeleted: false,
        tags: [],
        thumbnail: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        notes: [localNote, ...state.notes],
        currentNote: localNote,
      }));
      return localNote;
    }
  },

  updateNote: async (noteId, updates) => {
    set((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)),
      currentNote: state.currentNote?._id === noteId ? { ...state.currentNote, ...updates } : state.currentNote,
    }));
    try {
      await api.put(`/notes/${noteId}`, updates);
    } catch (err) {}
  },

  toggleFavorite: async (noteId) => {
    set((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? { ...n, isFavorite: !n.isFavorite } : n)),
      currentNote: state.currentNote?._id === noteId ? { ...state.currentNote, isFavorite: !state.currentNote.isFavorite } : state.currentNote,
    }));
    try {
      await api.post(`/notes/${noteId}/favorite`);
    } catch (err) {}
  },

  deleteNote: async (noteId) => {
    const { activeFilter } = get();
    if (activeFilter === 'trash') {
      // Permanent delete
      set((state) => ({
        notes: state.notes.filter((n) => n._id !== noteId),
        currentNote: state.currentNote?._id === noteId ? null : state.currentNote,
      }));
      try {
        await api.delete(`/notes/${noteId}/permanent`);
      } catch (err) {}
    } else {
      // Soft delete to trash
      set((state) => ({
        notes: state.notes.map((n) => (n._id === noteId ? { ...n, isDeleted: true, deletedAt: new Date().toISOString() } : n)),
        currentNote: state.currentNote?._id === noteId ? null : state.currentNote,
      }));
      try {
        await api.delete(`/notes/${noteId}`);
      } catch (err) {}
    }
  },

  restoreNote: async (noteId) => {
    set((state) => ({
      notes: state.notes.map((n) => (n._id === noteId ? { ...n, isDeleted: false, deletedAt: null } : n)),
    }));
    try {
      await api.post(`/notes/${noteId}/restore`);
    } catch (err) {}
  },
}));
