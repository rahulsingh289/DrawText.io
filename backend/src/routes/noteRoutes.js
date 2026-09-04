import express from 'express';
import { 
  listNotes, 
  getNote, 
  createNote, 
  updateNote, 
  softDeleteNote, 
  restoreNote, 
  permanentDeleteNote, 
  toggleFavorite 
} from '../controllers/noteController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', softDeleteNote);
router.post('/:id/restore', restoreNote);
router.delete('/:id/permanent', permanentDeleteNote);
router.post('/:id/favorite', toggleFavorite);

export default router;
