import mongoose from 'mongoose';

// Decoupled from Note metadata to scale canvas strokes efficiently
const canvasDataSchema = new mongoose.Schema({
  noteId: { type: String, required: true, unique: true, index: true },
  version: { type: Number, default: 1 },
  viewport: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    zoom: { type: Number, default: 1 }
  },
  // Elements: lines, pens, shapes, texts, formulas, images
  elements: [{ type: mongoose.Schema.Types.Mixed }],
  pages: [{
    pageIndex: { type: Number, default: 0 },
    title: { type: String, default: 'Page 1' },
    elements: [{ type: mongoose.Schema.Types.Mixed }]
  }]
}, { timestamps: true });

export const CanvasData = mongoose.model('CanvasData', canvasDataSchema);
