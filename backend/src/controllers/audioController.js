import { AudioService } from '../services/audioService.js';
import { storageAdapter } from '../storage/storageAdapter.js';

export const listMemos = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const memos = await AudioService.listMemos(noteId, req.user._id);
    res.json({ success: true, count: memos.length, data: memos });
  } catch (err) {
    next(err);
  }
};

export const uploadAndSaveMemo = async (req, res, next) => {
  try {
    const { noteId, title, durationSeconds, posX, posY } = req.body;
    
    let audioUrl = '';
    if (req.file) {
      audioUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.audioUrl) {
      audioUrl = req.body.audioUrl;
    } else {
      return res.status(400).json({ success: false, error: 'Audio file or audioUrl is required' });
    }

    const memo = await AudioService.saveMemo(req.user._id, {
      noteId,
      title: title || 'Voice Recording',
      audioUrl,
      durationSeconds: Number(durationSeconds) || 0,
      canvasPosition: {
        x: Number(posX) || 150,
        y: Number(posY) || 150
      }
    });

    res.status(201).json({ success: true, data: memo });
  } catch (err) {
    next(err);
  }
};

export const deleteMemo = async (req, res, next) => {
  try {
    const result = await AudioService.deleteMemo(req.params.id, req.user._id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
