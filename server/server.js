import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import booksRouter from './routes/bookRoutes.js';

dotenv.config();
console.log("API KEY is:", process.env.CLOUDINARY_API_KEY);

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Optional root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send('📚 Book Vault API is running!');
});

// ✅ This connects the routes
app.use('/api/books', booksRouter);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ MongoDB connection failed:', err));