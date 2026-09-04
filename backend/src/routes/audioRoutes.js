import express from 'express';
import { listMemos, uploadAndSaveMemo, deleteMemo } from '../controllers/audioController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../storage/storageAdapter.js';

const router = express.Router();

router.use(requireAuth);

router.get('/note/:noteId', listMemos);
router.post('/upload', upload.single('audio'), uploadAndSaveMemo);
router.post('/', upload.single('audio'), uploadAndSaveMemo);
router.delete('/:id', deleteMemo);


export default router;
