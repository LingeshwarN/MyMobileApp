const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (Exp 11)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware (Exp 10)
app.use(cors());
app.use(express.json());

// Request logging middleware (Exp 9 & 10)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes (Exp 9, 10, 11, 12 + full stack)
app.use('/api/movies', require('./routes/movies'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/theaters', require('./routes/theaters'));
app.use('/api/showtimes', require('./routes/showtimes'));
app.use('/api/swaps', require('./routes/swaps'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Root endpoint (Exp 9)
app.get('/', (req, res) => {
  res.json({
    app: 'CineBooks Backend Server API',
    status: 'Running',
    version: '1.0.0',
    endpoints: [
      '/api/movies',
      '/api/genres',
      '/api/auth/register',
      '/api/auth/login',
      '/api/bookings',
      '/api/promotions',
      '/api/users/:id',
      '/api/theaters',
      '/api/showtimes',
      '/api/swaps/*',
      '/api/health',
    ],
  });
});

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler (Exp 9 & 10)
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Socket.io seat-swap namespace shared with the Express app
app.set('io', null);

if (require.main === module) {
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'test') {
    const initSeatSwap = require('./sockets/seatSwap');
    app.set('io', initSeatSwap(server));
  }

  server.listen(PORT, () => {
    console.log(`🚀 CineBooks Node.js Server listening on port ${PORT}`);
  });
}

module.exports = app;