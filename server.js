const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://10.0.2.2:3000', 'http://192.168.1.2:3000']; // Default for local development

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('ORCare backend is successfully connected');
});

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/chat', chatRoutes);

const start = async () => {
    const PORT = process.env.PORT || 3000;
    
    // Start listening immediately
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀 ORCare Backend Server is LIVE on port ${PORT}`);
        
        console.log('----------------------------');
        const interfaces = require('os').networkInterfaces();
        console.log('For EMULATOR: http://10.0.2.2:' + PORT);
        console.log('For PHYSICAL DEVICE, use one of these:');
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    console.log(`  ➤ ${name}: http://${iface.address}:${PORT}`);
                }
            }
        }
        console.log('----------------------------\n');
    });

    // Attempt DB connection in background
    try {
        console.log('⏳ Connecting to MongoDB...');
        await connectDB();
    } catch (error) {
        console.error('⚠️ MongoDB Connection Warning:', error.message || error);
        console.log('💡 Note: Application will run, but database features (login, save chat) may fail.');
    }
};

start();
