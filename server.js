const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Load environment variables FIRST
dotenv.config();

// Supabase client
const { supabase } = require('./config/supabase');

const app = express();

// Security Middlewares (Phase 11)
app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' }
});

// Apply rate limiting to all /api routes
app.use('/api/', apiLimiter);

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://10.0.2.2:3000', 'http://192.168.1.2:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://192.168.') || 
        origin.startsWith('http://172.') || 
        origin.startsWith('http://10.') || 
        allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const quizRoutes = require('./routes/quizRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); // Changed from /api/users to /api/user (Phase 4)
app.use('/api/content', contentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes); // Wired up Quiz routes

// Phase 9: Health Check Endpoint
app.get('/api/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let errorMessage = null;

    try {
        const { error } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (error) {
            dbStatus = 'error';
            errorMessage = error.message;
            console.error('[HealthCheck] Supabase error:', error.message);
        } else {
            dbStatus = 'connected';
        }
    } catch (e) {
        dbStatus = 'error';
        errorMessage = e.message;
        console.error('[HealthCheck] Internal error:', e.message);
    }

    res.status(200).json({
        success: true,
        database: dbStatus,
        error: process.env.NODE_ENV !== 'production' ? errorMessage : undefined,
        server: 'running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Phase 10: Version Endpoint
app.get('/api/version', (req, res) => {
    res.status(200).json({
        success: true,
        latest: '1.0.0',
        minimum: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('ORCare backend is successfully connected');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Exception:', err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const start = async () => {
    const PORT = process.env.PORT || 3000;
    
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 ORCare Backend Server is LIVE on port ${PORT}`);
    });

    // Verify DB connection on startup
    try {
        console.log('⏳ Verifying Supabase PostgreSQL connection...');
        const { error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase PostgreSQL Connected Successfully!');
    } catch (error) {
        console.error('⚠️ PostgreSQL Connection Warning:', error.message || error);
    }
};

start();
