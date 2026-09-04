import express from 'express';
import { getCanvas, saveCanvas, clearCanvas } from '../controllers/canvasController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/:noteId', getCanvas);
router.put('/:noteId', saveCanvas);
router.post('/:noteId/clear', clearCanvas);

export default router;
