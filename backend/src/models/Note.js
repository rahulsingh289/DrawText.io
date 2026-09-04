import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'Untitled Note', trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  folderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null, index: true },
  type: { 
    type: String, 
    enum: ['whiteboard', 'notebook', 'pdf', 'card_set'], 
    default: 'whiteboard',
    index: true 
  },
  isFavorite: { type: Boolean, default: false, index: true },
  isDeleted: { type: Boolean, default: false, index: true }, // Soft delete support
  deletedAt: { type: Date, default: null },
  tags: [{ type: String, trim: true }],
  thumbnail: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  backgroundSettings: {
    template: { type: String, default: 'grid' }, // 'blank', 'grid', 'dots', 'ruled'
    backgroundColor: { type: String, default: '#12141c' },
    gridColor: { type: String, default: '#262a3b' },
    spacing: { type: String, default: 'medium' } // 'small', 'medium', 'large'
  },
  lastModifiedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Scalable compound indexes for fast filtering & sorting
noteSchema.index({ userId: 1, type: 1, isDeleted: 1 });
noteSchema.index({ userId: 1, isFavorite: 1, isDeleted: 1 });
noteSchema.index({ userId: 1, folderId: 1, isDeleted: 1 });

export const Note = mongoose.model('Note', noteSchema);
