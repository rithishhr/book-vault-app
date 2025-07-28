import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import axios from "axios";
import BASE_URL from "../services/api";

const gradientColors = "from-blue-500 via-purple-600 to-pink-500";
const buttonGradient = "from-purple-600 to-pink-500";

function BookForm({ onUploaded }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const maxSize = 5 * 1024 * 1024;

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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
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
      await axios.post(`${BASE_URL}/api/books`, formData, {
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
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      setStatus("❌ Upload failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-sm mx-auto p-5 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 relative"
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${gradientColors} rounded-t-xl`} />

      <h2 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-6">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
          Add Your Book
        </span>
        <span className="block w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-1.5 rounded-full" />
      </h2>

      <div className="space-y-4">
        <InputField label="Book Title" id="title" value={title} setValue={setTitle} placeholder="e.g., The Midnight Library" />
        <InputField label="Author Name" id="author" value={author} setValue={setAuthor} placeholder="e.g., Matt Haig" />
        <TextareaField label="Book Description" id="description" value={description} setValue={setDescription} placeholder="A brief summary of your book..." />

        {/* Small Dropzone */}
        <div
          {...getRootProps()}
          className={`relative flex flex-col items-center justify-center px-4 py-3 w-36 h-36 mx-auto border-2 border-dashed rounded-md transition-colors group
            ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50"}
            hover:border-blue-400 hover:bg-blue-50/70 dark:hover:border-blue-500 dark:hover:bg-blue-900/30 cursor-pointer`}
          onClick={open}
        >
          <input {...getInputProps()} />
          {preview ? (
            <PreviewImage preview={preview} onRemove={() => {
              setPreview(null);
              setCover(null);
              setStatus("Image removed.");
            }} />
          ) : <UploadPlaceholder isDragActive={isDragActive} />}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && <ProgressBar progress={uploadProgress} />}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold py-2.5 rounded-xl text-base shadow-md hover:shadow-lg"
          disabled={uploadProgress > 0 && uploadProgress < 100}
        >
          {uploadProgress > 0 && uploadProgress < 100 ? (
            <span className="flex items-center justify-center text-sm">
              <SpinnerIcon /> Uploading {uploadProgress}%
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

// Capitalized helper components
const InputField = ({ label, id, value, setValue, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{label}</label>
    <input
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-800 transition text-sm"
    />
  </div>
);

const TextareaField = ({ label, id, value, setValue, placeholder }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{label}</label>
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      rows="3"
      className="w-full p-2.5 rounded-lg border border-gray-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-pink-400 dark:focus:ring-pink-800 transition resize-y text-sm"
    />
  </div>
);

const PreviewImage = ({ preview, onRemove }) => (
  <div className="relative w-20 h-20 mb-1 rounded-sm overflow-hidden shadow-sm">
    <img src={preview} alt="Book Cover Preview" className="w-full h-full object-contain rounded-sm" />
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-[0.6rem] hover:bg-red-600 transition-colors"
      aria-label="Remove image"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

const UploadPlaceholder = ({ isDragActive }) => (
  <>
    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:text-gray-500 dark:group-hover:text-blue-400 transition-colors duration-200"
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
    </svg>
    <p className="mt-1 text-xs font-medium text-gray-700 dark:text-gray-300">
      Drag or <span className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Browse</span>
    </p>
    <p className="text-[0.65rem] text-gray-500 dark:text-gray-400">(max 5MB)</p>
    {isDragActive && (
      <p className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-blue-500/10 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold rounded-md animate-pulse text-xs">
        Drop here!
      </p>
    )}
  </>
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-3">
    <motion.div
      className={`h-2.5 rounded-full bg-gradient-to-r ${gradientColors}`}
      style={{ width: `${progress}%` }}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.3 }}
    ></motion.div>
  </div>
);

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
    viewBox="0 0 24 24" stroke="currentColor">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default BookForm;
