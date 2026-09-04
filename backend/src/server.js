import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config/environment.js';
import { connectDB } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { setupCollabSocket } from './sockets/collabHandler.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with robust CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));

// Attach API Routes
app.use('/api', apiRouter);

// Centralized Error Handler
app.use(errorHandler);

// Setup WebSockets
setupCollabSocket(io);

// Start Server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      console.log(`✨ Server running dynamically on http://localhost:${config.port}`);
      console.log(`🔌 WebSockets listening for real-time collaboration`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
