import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './server/routes/authRoutes.ts';
import ticketRoutes from './server/routes/ticketRoutes.ts';
import chatRoutes from './server/routes/chatRoutes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/chat', chatRoutes);

// Health probe
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'NexusAI Enterprise Server',
    timestamp: new Date().toISOString(),
  });
});

// Vite Middleware for Full-Stack React in Development / Static files in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(` NexusAI Enterprise Server active at http://localhost:${PORT}`);
});
