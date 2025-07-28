import { useEffect, useState } from "react";
import axios from "axios";
import { FiEdit, FiTrash } from "react-icons/fi";
import BASE_URL from "../services/api";

export default function BookList({ onEdit, refresh, showToast }) {
  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/books`);
      setBooks(res.data);
    } catch (err) {
      console.error("Error fetching books:", err);
      showToast("❌ Failed to fetch books", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/books/${id}`);
      fetchBooks();
      showToast("✅ Book deleted", "success");
    } catch (err) {
      console.error("Error deleting book:", err);
      showToast("❌ Deletion failed", "error");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [refresh]);

  if (books.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-300 mt-10">
        No books found. Upload one to get started!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
      {books.map((book) => (
        <div
          key={book._id}
          className="bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-gray-200 dark:border-zinc-700 overflow-hidden transition-transform hover:scale-105"
        >
          {/* Cover Image */}
          <div className="flex justify-center p-3 bg-gray-100 dark:bg-zinc-700">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-32 h-48 object-cover rounded-md shadow-sm"
            />
          </div>

          {/* Book Info */}
          <div className="px-4 py-3">
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 truncate">
              {book.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              👤 {book.author}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-300 mt-2 line-clamp-3">
              {book.description}
            </p>

            {/* Edit/Delete Buttons */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => onEdit(book)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition"
                title="Edit Book"
              >
                <FiEdit size={18} />
              </button>
              <button
                onClick={() => handleDelete(book._id)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 transition"
                title="Delete Book"
              >
                <FiTrash size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
