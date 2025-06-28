// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import connectDB from './config/db.js';
// import authRouter from './routes/auth.js';
// import imagesRouter from './routes/images.js';
// import albumsRouter from './routes/albums.js';
// import generateRouter from './routes/generate.js';

// dotenv.config();
// const app = express();

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true,
//   exposedHeaders: ['x-auth-token', 'Content-Type']
// }));
// app.use(express.json());

// connectDB();

// app.use('/api/auth', authRouter);
// app.use('/api/images', imagesRouter);
// app.use('/api/albums', albumsRouter);
// app.use('/api/generate', generateRouter);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

// CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self';" +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';" +
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com;" +
    "font-src 'self' fonts.gstatic.com;" +
    "img-src 'self' data: blob:;" +
    "connect-src 'self' http://localhost:5000"
  );
  next();
});

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://photo-editor-2.onrender.com' // ← Вставь сюда имя фронтенда на Render
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['x-auth-token', 'x-refreshed-token', 'Content-Type']
}));


app.use(express.json());

// Passport
import initializePassport from './config/passport.js';
const passport = initializePassport();
app.use(passport.initialize());

// Routes
import authRouter from './routes/auth.js';
import imagesRouter from './routes/images.js';
import albumsRouter from './routes/albums.js';
import generateRouter from './routes/generate.js';

app.use('/api/auth', authRouter);
app.use('/api/images', imagesRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/generate', generateRouter);

// Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});


// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

    process.on('SIGINT', async () => {
      console.log('\n⛔ SIGINT received. Closing server...');
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      server.close(() => {
        console.log('🛑 Server shut down');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
