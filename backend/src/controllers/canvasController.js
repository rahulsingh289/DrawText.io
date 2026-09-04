import { CanvasService } from '../services/canvasService.js';

export const getCanvas = async (req, res, next) => {
  try {
    const canvas = await CanvasService.getCanvasData(req.params.noteId, req.user._id);
    res.json({ success: true, data: canvas });
  } catch (err) {
    next(err);
  }
};

export const saveCanvas = async (req, res, next) => {
  try {
    const { elements, viewport, pages, thumbnail } = req.body;
    const canvas = await CanvasService.saveCanvasData(req.params.noteId, req.user._id, {
      elements,
      viewport,
      pages,
      thumbnail
    });
    res.json({ success: true, data: canvas });
  } catch (err) {
    next(err);
  }
};

export const clearCanvas = async (req, res, next) => {
  try {
    const canvas = await CanvasService.clearCanvas(req.params.noteId, req.user._id);
    res.json({ success: true, message: 'Canvas cleared', data: canvas });
  } catch (err) {
    next(err);
  }
};
