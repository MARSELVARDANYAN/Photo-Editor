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

// ✅ Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://apis.google.com; " +
    "connect-src 'self' https://*.onrender.com https://api.facebook.com; " +
    "frame-src 'self' https://accounts.google.com https://www.facebook.com;"
  );
  next();
});


// ✅ CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://photo-editor-1.onrender.com'
  ],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
}));


app.use(express.json());
app.set('trust proxy', 1);

// ✅ Passport
import initializePassport from './config/passport.js';
const passport = initializePassport();
app.use(passport.initialize());

// ✅ Routes
import authRouter from './routes/auth.js';
import imagesRouter from './routes/images.js';
import albumsRouter from './routes/albums.js';
import generateRouter from './routes/generate.js';

app.use('/api/auth', authRouter);
app.use('/api/images', imagesRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/generate', generateRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

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
