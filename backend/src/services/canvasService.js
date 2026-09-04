import mongoose from 'mongoose';
import { CanvasData } from '../models/CanvasData.js';
import { Note } from '../models/Note.js';

export class CanvasService {
  static async getCanvasData(noteId, userId) {
    if (mongoose.Types.ObjectId.isValid(noteId)) {
      const note = await Note.findOne({ _id: noteId });
      // If note exists but userId doesn't match and not demo, check
      if (note && userId && String(note.userId) !== String(userId)) {
        console.warn('Note userId mismatch, allowing shared canvas view');
      }
    }

    let canvas = await CanvasData.findOne({ noteId: String(noteId) });
    if (!canvas) {
      canvas = await CanvasData.create({
        noteId: String(noteId),
        viewport: { x: 0, y: 0, zoom: 1 },
        elements: [],
        pages: [{ pageIndex: 0, title: 'Page 1', elements: [] }]
      });
    }
    return canvas;
  }

  static async saveCanvasData(noteId, userId, { elements, viewport, pages, thumbnail }) {
    if (mongoose.Types.ObjectId.isValid(noteId)) {
      const noteUpdates = { lastModifiedAt: new Date() };
      if (thumbnail) noteUpdates.thumbnail = thumbnail;
      await Note.findByIdAndUpdate(noteId, noteUpdates);
    }

    const updateDoc = {
      $inc: { version: 1 }
    };
    if (elements !== undefined) updateDoc.elements = elements;
    if (viewport !== undefined) updateDoc.viewport = viewport;
    if (pages !== undefined) updateDoc.pages = pages;

    const canvas = await CanvasData.findOneAndUpdate(
      { noteId: String(noteId) },
      updateDoc,
      { new: true, upsert: true }
    );

    return canvas;
  }

  static async clearCanvas(noteId, userId) {
    if (mongoose.Types.ObjectId.isValid(noteId)) {
      await Note.findByIdAndUpdate(noteId, { thumbnail: '', lastModifiedAt: new Date() });
    }

    const canvas = await CanvasData.findOneAndUpdate(
      { noteId: String(noteId) },
      { elements: [], viewport: { x: 0, y: 0, zoom: 1 }, pages: [{ pageIndex: 0, title: 'Page 1', elements: [] }] },
      { new: true, upsert: true }
    );
    return canvas;
  }
}

