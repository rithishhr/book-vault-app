// client/src/components/BookForm.jsx
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import axios from "axios";

// Helper for vibrant gradients - can be adjusted
const gradientColors = "from-blue-500 via-purple-600 to-pink-500";
const buttonGradient = "from-purple-600 to-pink-500";

function BookForm({ onUploaded }) { // Destructure onUploaded prop
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const maxSize = 5 * 1024 * 1024; // 5MB

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      const reason = fileRejections[0].errors[0].message;
      setStatus(`❌ ${reason}`);
      setPreview(null);
      setCover(null);
      return;
    }

    const file = acceptedFiles[0];
    setCover(file);
    setPreview(URL.createObjectURL(file));
    setStatus("✅ Image selected!");
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open
  } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
    maxSize,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setUploadProgress(0);

    if (!title || !author || !description || !cover) {
      setStatus("❌ Please fill all fields and upload a cover image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("coverImage", cover);

    try {
      await axios.post("http://localhost:5000/api/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      setStatus("✅ Book uploaded successfully!");
      setTitle("");
      setAuthor("");
      setDescription("");
      setCover(null);
      setPreview(null);
      setUploadProgress(0);
      if (onUploaded) { // Call onUploaded prop if it exists
        onUploaded();
      }
    } catch (err) {
      console.error("Upload Error:", err.response ? err.response.data : err.message);
      setStatus("❌ Upload failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-sm mx-auto p-5 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradientColors} rounded-t-xl`}></div>

      <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-6 relative">
        <span className={`bg-clip-text text-transparent bg-gradient-to-r ${gradientColors}`}>
          Add Your Book
        </span>
        <span className="block w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-1.5 rounded-full"></span>
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Book Title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g., The Midnight Library"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-800 transition text-sm"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Author Name</label>
          <input
            id="author"
            type="text"
            placeholder="e.g., Matt Haig"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-purple-400 dark:focus:ring-purple-800 transition text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">Book Description</label>
          <textarea
            id="description"
            placeholder="A brief summary of your book..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-pink-400 dark:focus:ring-pink-800 transition resize-y text-sm"
          />
        </div>

        {/* ✅ Smaller Drag & Drop Area */}
        <div
          {...getRootProps()}
          className={`
            relative flex flex-col items-center justify-center p-3 rounded-md border-2 transition-colors duration-300 ease-in-out group
            ${isDragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"
            }
            hover:border-blue-400 hover:bg-blue-50/70 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 cursor-pointer
          `}
          onClick={open}
        >
          <input {...getInputProps()} />
          {preview ? (
            <div className="relative w-20 h-20 mb-1 rounded-sm overflow-hidden shadow-sm">
              <img
                src={preview}
                alt="Book Cover Preview"
                className="w-full h-full object-contain rounded-sm"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                  setCover(null);
                  setStatus("Image removed.");
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-[0.6rem] hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Drag or <span className={`text-blue-600 dark:text-blue-400 font-bold hover:underline`}>Browse</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                (max 5MB)
              </p>
              {isDragActive && (
                <p className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold rounded-md animate-pulse text-xs">
                  Drop here!
                </p>
              )}
            </>
          )}
        </div>

        {/* ✅ Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-3">
            <motion.div
              className={`h-2.5 rounded-full bg-gradient-to-r ${gradientColors}`}
              style={{ width: `${uploadProgress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            ></motion.div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2.5 rounded-xl text-base shadow-md hover:shadow-lg"
          disabled={uploadProgress > 0 && uploadProgress < 100}
        >
          {uploadProgress > 0 && uploadProgress < 100 ? (
            <span className="flex items-center justify-center text-sm">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading {uploadProgress}%
            </span>
          ) : (
            "🚀 Upload Book"
          )}
        </motion.button>

        {status && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`text-center text-xs font-medium dark:text-white ${status.startsWith("✅") ? "text-green-600" : "text-red-600"}`}
          >
            {status}
          </motion.p>
        )}
      </div>
    </form>
  );
}

export default BookForm;