import { AudioMemo } from '../models/AudioMemo.js';

export class AudioService {
  static async listMemos(noteId, userId) {
    return await AudioMemo.find({ noteId, userId }).sort({ createdAt: -1 });
  }

  static async saveMemo(userId, { noteId, title, audioUrl, durationSeconds, canvasPosition }) {
    return await AudioMemo.create({
      userId,
      noteId,
      title: title || 'Voice Recording',
      audioUrl,
      durationSeconds: durationSeconds || 0,
      canvasPosition: canvasPosition || { x: 100, y: 100 }
    });
  }

  static async deleteMemo(memoId, userId) {
    const memo = await AudioMemo.findOneAndDelete({ _id: memoId, userId });
    if (!memo) throw new Error('Voice memo not found');
    return { success: true, message: 'Voice memo removed' };
  }
}
