import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

const corsOrigin = process.env.FRONTEND_ORIGIN || true;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '256kb' }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;
