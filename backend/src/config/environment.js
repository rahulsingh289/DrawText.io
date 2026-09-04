import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/drawtext_db',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_drawtext_app_2026_scalable',
  jwtExpiresIn: '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  storageType: process.env.STORAGE_TYPE || 'local', // 'local' | 's3'
  uploadDir: 'uploads'
};
