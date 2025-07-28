// server/routes/bookRoutes.js
import express from 'express';
import Book from '../models/Book.js';
import upload from '../middleware/upload.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// ✅ GET all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST add book with image
router.post('/', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, author, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Invalid image format. Only JPG and PNG are allowed.' });
    }

    const newBook = new Book({
      title,
      author,
      description,
      coverImage: req.file.path,
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ PUT update book with optional image
router.put('/:id', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, author, description } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.title = title;
    book.author = author;
    book.description = description;

    if (req.file) {
      // delete old image from Cloudinary if exists
      const oldPublicId = book.coverImage?.split('/').pop().split('.')[0];
      if (oldPublicId) {
        await cloudinary.uploader.destroy(`book-covers/${oldPublicId}`);
      }
      book.coverImage = req.file.path;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE book + Cloudinary image
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Delete image from Cloudinary
    const publicId = book.coverImage?.split('/').pop().split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`book-covers/${publicId}`);
    }

    res.json({ message: '✅ Book and image deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
