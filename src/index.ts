import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root / Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'QuickCourt Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/users/me'],
      customer: [
        'GET /api/venues',
        'GET /api/venues/:id',
        'GET /api/smart-picks?courtId=crt-1&date=2026-08-28',
        'POST /api/bookings',
        'POST /api/payments',
        'GET /api/bookings',
        'GET /api/users/profile',
      ],
      owner: [
        'POST /api/facilities',
        'GET /api/facilities/my',
        'PATCH /api/facilities/:id',
        'POST /api/facilities/:facilityId/courts',
        'POST /api/courts/:courtId/blocks',
        'GET /api/owner/bookings',
        'GET /api/owner/analytics',
      ],
      admin: [
        'GET /api/admin/dashboard',
        'GET /api/admin/facilities/pending',
        'PATCH /api/admin/facilities/:id/approve',
        'GET /api/admin/users',
        'PATCH /api/admin/users/:id/ban',
      ],
    },
  });
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`⚡ QuickCourt Server running on port ${PORT}`);
});
