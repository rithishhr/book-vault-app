// server/models/Book.js
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String }, // URL of the uploaded image
});

const Book = mongoose.model('Book', bookSchema);

export default Book;
