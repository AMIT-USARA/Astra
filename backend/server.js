import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import resumeRoutes from './routes/resumeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { aiModel } from './services/ai.js';
import { initStorage, storageMode } from './services/storage.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const PORT = Number(process.env.PORT || 5000);
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim());

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: origins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', storage: storageMode(), ai: aiModel(), uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);

// If the frontend has been built (npm run build), serve it too, so the whole app runs on one port.
const dist = path.resolve(import.meta.dirname, '../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(dist, 'index.html')));
}
app.use(notFound);
app.use(errorHandler);

await initStorage(process.env.MONGODB_URI);
app.listen(PORT, () => {
  console.log(`[server] API running on http://localhost:${PORT}/api`);
  if (fs.existsSync(dist)) console.log(`[server] Open the app at http://localhost:${PORT}`);
});
