import express from 'express';
import cors from 'cors';
import { apiRouter } from '../server/api.ts';
import { getDb } from '../server/db.ts';

const app = express();

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

let dbInitPromise: Promise<any> | null = null;
app.use(async (_req, _res, next) => {
  try {
    if (!dbInitPromise) {
      dbInitPromise = getDb();
    }
    await dbInitPromise;
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    app: 'CampusHub Africa',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', apiRouter);

export default app;
