import mongoose from 'mongoose';
import { Note } from '../models/Note.js';
import { CanvasData } from '../models/CanvasData.js';

export class NoteService {
  static async listNotes({ userId, type, folderId, isFavorite, isDeleted, search, sortBy, sortOrder }) {
    const query = { userId };

    if (isDeleted !== undefined) {
      query.isDeleted = isDeleted === 'true' || isDeleted === true;
    } else {
      query.isDeleted = false;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (folderId !== undefined) {
      query.folderId = folderId === 'null' || folderId === '' ? null : folderId;
    }

    if (isFavorite !== undefined && isFavorite !== '') {
      query.isFavorite = isFavorite === 'true' || isFavorite === true;
    }

    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    let sort = { updatedAt: -1 };
    if (sortBy === 'name') {
      sort = { title: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'createdAt') {
      sort = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    } else if (sortBy === 'updatedAt') {
      sort = { updatedAt: sortOrder === 'asc' ? 1 : -1 };
    }

    return await Note.find(query).populate('folderId', 'name color').sort(sort).lean();
  }

  static async getNoteById(noteId, userId) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      // Return a simulated note for mock/slug ID
      return {
        _id: noteId,
        title: 'Untitled Whiteboard',
        type: 'whiteboard',
        userId,
        isFavorite: false,
        isDeleted: false,
        backgroundSettings: { template: 'grid', backgroundColor: '#12141c', gridColor: '#262a3b', spacing: 'medium' }
      };
    }
    const note = await Note.findOne({ _id: noteId });
    if (!note) throw new Error('Note not found');
    return note;
  }

  static async createNote({ userId, title, type = 'whiteboard', folderId = null, backgroundSettings = {} }) {
    const note = await Note.create({
      userId,
      title: title || (type === 'whiteboard' ? 'Untitled Whiteboard' : 'Untitled Note'),
      type,
      folderId: folderId || null,
      backgroundSettings: {
        template: backgroundSettings.template || 'grid',
        backgroundColor: backgroundSettings.backgroundColor || '#12141c',
        gridColor: backgroundSettings.gridColor || '#262a3b',
        spacing: backgroundSettings.spacing || 'medium'
      }
    });

    // Initialize blank canvas data record
    await CanvasData.create({
      noteId: String(note._id),
      viewport: { x: 0, y: 0, zoom: 1 },
      elements: [],
      pages: [{ pageIndex: 0, title: 'Page 1', elements: [] }]
    });

    return note;
  }

  static async updateNote(noteId, userId, updates) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return { _id: noteId, ...updates, updatedAt: new Date() };
    }
    const note = await Note.findOneAndUpdate(
      { _id: noteId },
      { ...updates, lastModifiedAt: new Date() },
      { new: true }
    );
    if (!note) throw new Error('Note not found');
    return note;
  }

  static async softDeleteNote(noteId, userId) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return { _id: noteId, isDeleted: true };
    }
    const note = await Note.findOneAndUpdate(
      { _id: noteId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!note) throw new Error('Note not found');
    return note;
  }

  static async restoreNote(noteId, userId) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return { _id: noteId, isDeleted: false };
    }
    const note = await Note.findOneAndUpdate(
      { _id: noteId },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!note) throw new Error('Note not found');
    return note;
  }

  static async permanentDeleteNote(noteId, userId) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      await CanvasData.findOneAndDelete({ noteId: String(noteId) });
      return { success: true, message: 'Note permanently deleted' };
    }
    const note = await Note.findOneAndDelete({ _id: noteId });
    await CanvasData.findOneAndDelete({ noteId: String(noteId) });
    return { success: true, message: 'Note permanently deleted' };
  }

  static async toggleFavorite(noteId, userId) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return { _id: noteId, isFavorite: true };
    }
    const note = await Note.findOne({ _id: noteId });
    if (!note) throw new Error('Note not found');
    note.isFavorite = !note.isFavorite;
    await note.save();
    return note;
  }
}

