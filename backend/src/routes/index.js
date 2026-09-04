import express from 'express';
import authRoutes from './authRoutes.js';
import noteRoutes from './noteRoutes.js';
import canvasRoutes from './canvasRoutes.js';
import folderRoutes from './folderRoutes.js';
import billingRoutes from './billingRoutes.js';
import audioRoutes from './audioRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'Notes & Whiteboard API Engine',
    version: '1.0.0'
  });
});

router.use('/auth', authRoutes);
router.use('/notes', noteRoutes);
router.use('/canvas', canvasRoutes);
router.use('/folders', folderRoutes);
router.use('/billing', billingRoutes);
router.use('/audio', audioRoutes);

export default router;
