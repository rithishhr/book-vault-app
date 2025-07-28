// client/src/components/BookGallery.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

// Constants
const BASE_URL = "http://localhost:5000";
const primaryGradient = "from-blue-500 via-purple-600 to-pink-500";
const deleteButtonGradient = "from-red-500 to-orange-500";

function BookGallery({ galleryRefreshKey }) {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    coverImage: null,
    currentCoverPreview: null,
  });
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/books`);
      setBooks(res.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      setStatus("❌ Failed to load books. Try again.");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [galleryRefreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/books/${id}`);
      setStatus("✅ Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      setStatus("❌ Failed to delete book.");
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      coverImage: null,
      currentCoverPreview: book.coverImage,
    });
    setShowModal(true);
    setStatus("");
  };

  const handleModalClose = () => {
    setEditingBook(null);
    setShowModal(false);
    setFormData({
      title: "",
      author: "",
      description: "",
      coverImage: null,
      currentCoverPreview: null,
    });
    setStatus("");
  };

  const onDropEdit = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      const reason = fileRejections[0].errors[0].message;
      setStatus(`❌ ${reason}`);
      return;
    }
    const file = acceptedFiles[0];
    setFormData((prev) => ({ ...prev, coverImage: file }));
    setStatus("✅ New image selected for update.");
  }, []);

  const {
    getRootProps: getRootPropsEdit,
    getInputProps: getInputPropsEdit,
    isDragActive: isDragActiveEdit,
    open: openEdit,
  } = useDropzone({
    onDrop: onDropEdit,
    accept: { "image/jpeg": [], "image/png": [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBook) return;

    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("description", formData.description);
    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    }

    try {
      await axios.put(`${BASE_URL}/api/books/${editingBook._id}`, data);
      setStatus("✅ Book updated!");
      fetchBooks();
      handleModalClose();
    } catch (error) {
      console.error("Update error:", error);
      setStatus("❌ Failed to update book.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <motion.h2
        className="text-3xl font-extrabold text-center mb-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${primaryGradient}`}>
          Our Literary Collection
        </span>
      </motion.h2>

      {/* Book Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4">
        {books.length === 0 ? (
          <p className="col-span-full text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
            No books yet. Add some!
          </p>
        ) : (
          <AnimatePresence>
            {books.map((book) => (
              <motion.div
                key={book._id}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 relative group flex flex-col text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                layout
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-40 object-contain rounded mb-2"
                />
                <h3 className="font-semibold text-sm line-clamp-2">{book.title}</h3>
                <p className="text-xs text-purple-600 dark:text-purple-400 line-clamp-1">by {book.author}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300 line-clamp-3 mt-1">{book.description}</p>

                <div className="flex justify-center gap-2 mt-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                  <button
                    onClick={() => handleEditClick(book)}
                    className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-1 rounded hover:shadow-md"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className={`text-xs bg-gradient-to-r ${deleteButtonGradient} text-white px-2 py-1 rounded hover:shadow-md`}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleUpdate}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full relative"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <button
                type="button"
                onClick={handleModalClose}
                className="absolute top-2 right-2 text-gray-600 dark:text-gray-300"
              >
                ❌
              </button>
              <h3 className="text-xl font-bold text-center mb-4">Edit Book</h3>

              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title"
                className="w-full p-2 mb-2 rounded border dark:bg-gray-700"
              />
              <input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author"
                className="w-full p-2 mb-2 rounded border dark:bg-gray-700"
              />
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                className="w-full p-2 mb-2 rounded border dark:bg-gray-700"
              />

              {/* Dropzone */}
              <div {...getRootPropsEdit()} className="border-2 border-dashed p-4 rounded-lg text-center mb-4 cursor-pointer">
                <input {...getInputPropsEdit()} />
                {formData.coverImage || formData.currentCoverPreview ? (
                  <img
                    src={formData.coverImage ? URL.createObjectURL(formData.coverImage) : formData.currentCoverPreview}
                    alt="Preview"
                    className="w-24 h-24 mx-auto object-contain rounded"
                  />
                ) : (
                  <p className="text-sm text-gray-500">Click or drag image (JPG/PNG, max 5MB)</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded"
              >
                💾 Save Changes
              </button>

              {status && (
                <p className={`mt-3 text-sm text-center ${status.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                  {status}
                </p>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookGallery;
