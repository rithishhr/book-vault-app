// server/controllers/bookController.js

import Book from "../models/Book.js";
import cloudinary from "../config/cloudinary.js";

// 🆕 Cloudinary Upload Function
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "book-covers" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ➕ CREATE BOOK
export const createBook = async (req, res) => {
  try {
    let result = null;
    if (req.file) {
      result = await streamUpload(req.file.buffer);
    }

    const newBook = new Book({
      ...req.body,
      coverImage: result?.secure_url || "",
      cloudinaryId: result?.public_id || "",
    });

    await newBook.save();
    res.status(201).json({ message: "Book created", book: newBook });
  } catch (err) {
    res.status(500).json({ message: "Failed to create book", error: err });
  }
};

// 🔄 UPDATE BOOK
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (req.file) {
      if (book.cloudinaryId) {
        await cloudinary.uploader.destroy(book.cloudinaryId);
      }
      const result = await streamUpload(req.file.buffer);
      book.coverImage = result.secure_url;
      book.cloudinaryId = result.public_id;
    }

    book.title = req.body.title;
    book.author = req.body.author;
    book.description = req.body.description;

    await book.save();
    res.json({ message: "Book updated", book });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err });
  }
};

// ❌ DELETE BOOK
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.cloudinaryId) {
      await cloudinary.uploader.destroy(book.cloudinaryId);
    }

    await book.deleteOne();
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed", error: err });
  }
};

// 📚 GET ALL BOOKS
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch {
    res.status(500).json({ message: "Fetching books failed" });
  }
};
