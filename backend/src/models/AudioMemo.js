import mongoose from 'mongoose';

const audioMemoSchema = new mongoose.Schema({
  noteId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Voice Memo' },
  audioUrl: { type: String, required: true },
  durationSeconds: { type: Number, default: 0 },
  canvasPosition: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 }
  }
}, { timestamps: true });

export const AudioMemo = mongoose.model('AudioMemo', audioMemoSchema);
