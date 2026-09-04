import { NoteService } from '../services/noteService.js';

export const listNotes = async (req, res, next) => {
  try {
    const { type, folderId, isFavorite, isDeleted, search, sortBy, sortOrder } = req.query;
    const notes = await NoteService.listNotes({
      userId: req.user._id,
      type,
      folderId,
      isFavorite,
      isDeleted,
      search,
      sortBy,
      sortOrder
    });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    next(err);
  }
};

export const getNote = async (req, res, next) => {
  try {
    const note = await NoteService.getNoteById(req.params.id, req.user._id);
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const { title, type, folderId, backgroundSettings } = req.body;
    const note = await NoteService.createNote({
      userId: req.user._id,
      title,
      type,
      folderId,
      backgroundSettings
    });
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const note = await NoteService.updateNote(req.params.id, req.user._id, req.body);
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};

export const softDeleteNote = async (req, res, next) => {
  try {
    const note = await NoteService.softDeleteNote(req.params.id, req.user._id);
    res.json({ success: true, message: 'Note moved to trash', data: note });
  } catch (err) {
    next(err);
  }
};

export const restoreNote = async (req, res, next) => {
  try {
    const note = await NoteService.restoreNote(req.params.id, req.user._id);
    res.json({ success: true, message: 'Note restored from trash', data: note });
  } catch (err) {
    next(err);
  }
};

export const permanentDeleteNote = async (req, res, next) => {
  try {
    const result = await NoteService.permanentDeleteNote(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const note = await NoteService.toggleFavorite(req.params.id, req.user._id);
    res.json({ success: true, data: note });
  } catch (err) {
    next(err);
  }
};
