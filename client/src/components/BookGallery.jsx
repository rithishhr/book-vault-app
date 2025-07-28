// client/src/components/BookGallery.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";

// Re-using gradients for consistency
const primaryGradient = "from-blue-500 via-purple-600 to-pink-500";
const buttonGradient = "from-purple-600 to-pink-500";
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
      const res = await axios.get("http://localhost:5000/api/books");
      setBooks(res.data);
    } catch (error) {
      console.error("Error fetching books:", error);
      setStatus("Failed to load books. Please try again later.");
    }
  };

  // Re-fetch books whenever galleryRefreshKey changes (triggered by new book upload)
  useEffect(() => {
    fetchBooks();
  }, [galleryRefreshKey]); // Add galleryRefreshKey to dependency array

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      setStatus("✅ Book deleted successfully!");
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book:", error);
      setStatus("❌ Failed to delete book. Please try again.");
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book._id);
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
      setFormData((prev) => ({ ...prev, coverImage: null }));
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
    setStatus("");
    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("description", formData.description);
    if (formData.coverImage) {
      data.append("coverImage", formData.coverImage);
    }

    try {
      await axios.put(`http://localhost:5000/api/books/${editingBook}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("✅ Book updated successfully!");
      handleModalClose();
      fetchBooks(); // Re-fetch books to show updated data
    } catch (err) {
      console.error("Error updating book:", err.response ? err.response.data : err.message);
      setStatus("❌ Update failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <motion.h2
        className="text-3xl font-extrabold text-center mb-10 relative"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${primaryGradient}`}>
          Our Literary Collection
        </span>
        <span className="block w-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-2 rounded-full"></span>
      </motion.h2>

      {/* Adjusted grid for even smaller cards and more columns on larger screens */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
        {books.length === 0 ? (
          <motion.p
            className="col-span-full text-center text-base text-gray-600 dark:text-gray-400 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            No books in the gallery yet. Start by adding some!
          </motion.p>
        ) : (
          <AnimatePresence>
            {books.map((book) => (
              <motion.div
                key={book._id}
                className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out border border-gray-200 dark:border-gray-700 relative overflow-hidden group flex flex-col h-full text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                layout
              >
                {/* Background overlay for hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex-grow flex items-center justify-center mb-2">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-40 object-contain rounded-md mb-1 shadow-xs border border-gray-100 dark:border-gray-700"
                    />
                  </div>
                  <h3 className="font-semibold text-base mb-0.5 text-gray-900 dark:text-white line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1 line-clamp-1">
                    by {book.author}
                  </p>
                  <p className="text-[0.65rem] text-gray-600 dark:text-gray-300 mb-2 line-clamp-3 flex-grow">
                    {book.description}
                  </p>
                  <div className="flex gap-1 justify-center mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                    <motion.button
                      onClick={() => handleEditClick(book)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium py-1 px-2 rounded-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-0.5 text-xs"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.829-2.828z" />
                      </svg>
                      Edit
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(book._id)}
                      className={`bg-gradient-to-r ${deleteButtonGradient} text-white font-medium py-1 px-2 rounded-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-0.5 text-xs`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm2 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      Del
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ✅ Edit Book Modal - Keeping its size relatively independent */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalClose}
          >
            <motion.form
              onSubmit={handleUpdate}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full space-y-4 relative border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                onClick={handleModalClose}
                className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                Update Book Details
              </h3>

              <div>
                <label htmlFor="edit-title" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Book Title</label>
                <input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title"
                  className="w-full p-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-author" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Author</label>
                <input
                  id="edit-author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author"
                  className="w-full p-2 rounded-md border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition text-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Description</label>
                <textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description"
                  rows="3"
                  className="w-full p-2 rounded-md border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 transition resize-y text-sm"
                />
              </div>

              <div
                {...getRootPropsEdit()}
                className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer transition-all relative
                  ${isDragActiveEdit ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"}
                  hover:border-blue-400 hover:bg-blue-50/70 dark:hover:border-blue-500 dark:hover:bg-blue-900/30
                `}
                onClick={openEdit}
              >
                <input {...getInputPropsEdit()} />
                {formData.coverImage || formData.currentCoverPreview ? (
                  <div className="relative w-28 h-28 mx-auto mb-3 rounded-md overflow-hidden shadow-sm">
                    <img
                      src={formData.coverImage ? URL.createObjectURL(formData.coverImage) : formData.currentCoverPreview}
                      alt="Current Cover Preview"
                      className="w-full h-full object-contain rounded-md border border-gray-200 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, coverImage: null, currentCoverPreview: null }));
                        setStatus("Image cleared. Upload new or keep existing (if not saving blank).");
                      }}
                      className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 text-xs hover:bg-red-600 transition-colors"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Drag & drop new image, or <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">click to browse</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">JPG/PNG, max 5MB. Leave blank to keep current.</p>
                  </>
                )}
                {isDragActiveEdit && (
                  <p className="absolute inset-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold rounded-xl animate-pulse text-sm">
                    Drop your new image!
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-2.5 rounded-md text-base shadow-md hover:shadow-lg transition-all duration-200"
              >
                💾 Save Changes
              </motion.button>
              {status && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-center text-xs font-semibold mt-3 ${status.startsWith("✅") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {status}
                </motion.p>
              )}
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BookGallery;