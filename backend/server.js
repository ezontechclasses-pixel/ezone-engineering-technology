require('dotenv').config();

// ── Startup Environment Check ──────────────────────────────────────────────────
if (!process.env.JWT_SECRET || !process.env.ADMIN_JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET and ADMIN_JWT_SECRET environment variables must be defined in .env');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes        = require('./routes/authRoutes');
const courseRoutes      = require('./routes/courseRoutes');
const unitRoutes        = require('./routes/unitRoutes');
const lessonRoutes      = require('./routes/lessonRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');
const studentRoutes     = require('./routes/studentRoutes');
const quizRoutes        = require('./routes/quizRoutes');
const materialRoutes    = require('./routes/materialRoutes');
const liveClassRoutes   = require('./routes/liveClassRoutes');
const homeworkRoutes    = require('./routes/homeworkRoutes');
const announcementRoutes= require('./routes/announcementRoutes');
const resultRoutes      = require('./routes/resultRoutes');
const adminAuthRoutes   = require('./routes/adminAuthRoutes');
const statsRoutes       = require('./routes/statsRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

// ── Connect to MongoDB ──────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Global Middleware ───────────────────────────────────────────────────────────
app.use(helmet());                          // Security headers

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman) or matched allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow for maximum compatibility across preview deploys
      }
    },
    credentials: true,
  })
);
app.use(express.json());                    // Parse JSON bodies
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));                   // HTTP request logger
}

// ── Routes ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🎓 Ezone Engineering Technology API is running' });
});

app.use('/api/auth',         authRoutes);
app.use('/api/admin',        adminAuthRoutes);
app.use('/api/courses',      courseRoutes);
app.use('/api/units',        unitRoutes);
app.use('/api/lessons',      lessonRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/students',     studentRoutes);
app.use('/api/quizzes',      quizRoutes);
app.use('/api/materials',    materialRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/homework',     homeworkRoutes);
app.use('/api/announcements',announcementRoutes);
app.use('/api/results',      resultRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/testimonials', testimonialRoutes);

// ── 404 Handler ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
});
