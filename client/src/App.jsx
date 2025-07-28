// client/src/App.jsx
import { useState } from "react";
import Lottie from "lottie-react";
import bookAnimation from "./assets/bookAnimation.json"; // Ensure this path is correct!
import BookForm from "./components/BookForm";
import BookGallery from "./components/BookGallery";
import { showToast, ToastWrapper } from "./components/Toast"; // Assuming these exist and work
import { FiMoon, FiSun } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// Define consistent gradients for use across components
const headerGradient = "from-indigo-600 to-purple-700";
const buttonAddGradient = "from-blue-500 to-purple-500";
const toggleBgGradient = "from-purple-400 to-pink-500"; // For dark mode toggle background

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [dark, setDark] = useState(false);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0); // Key to force BookGallery refresh

  // Toggle dark mode class on the root HTML element
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  const handleBookUploaded = () => {
    setShowForm(false); // Hide form after successful upload
    showToast("Book uploaded successfully!", "success"); // Show global toast
    setGalleryRefreshKey(prevKey => prevKey + 1); // Increment key to force BookGallery re-render/re-fetch
  };

  return (
    // The main container sets the overall background and text color based on dark mode.
    // Ensure `dark` class is applied to `html` for Tailwind's `dark:` variants.
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 font-sans antialiased text-gray-900 dark:text-gray-100 flex flex-col">
      <ToastWrapper /> {/* Toast notifications will appear over everything */}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md py-3 px-4 sm:px-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-extrabold relative">
          <span className={`bg-clip-text text-transparent bg-gradient-to-r ${headerGradient}`}>
            Book Vault
          </span>
          {/* Subtle underline effect */}
          <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
        </h1>
        <button
          onClick={() => setDark(!dark)}
          className={`p-2 rounded-full bg-gradient-to-r ${toggleBgGradient} text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <FiSun className="h-5 w-5 sm:h-6 sm:w-6" /> : <FiMoon className="h-5 w-5 sm:h-6 sm:w-6" />}
        </button>
      </header>

      <main className="container mx-auto px-2 py-6 flex-grow overflow-y-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT - Form and Animation */}
          <section className="lg:w-1/2 flex flex-col items-center justify-center p-2">
            <motion.button
              onClick={() => setShowForm(!showForm)}
              className={`mb-6 px-6 py-3 bg-gradient-to-r ${buttonAddGradient} text-white font-bold text-base rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg">{showForm ? "✖️" : "✨"}</span>
              {showForm ? "Close Form" : "Add New Book"}
            </motion.button>

            {/* AnimatePresence for the BookForm */}
            <AnimatePresence mode="wait" initial={false}>
              {showForm && (
                <motion.div
                  key="book-form-section"
                  className="w-full max-w-sm mx-auto" // Added max-w-sm to restrain form width
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <BookForm onUploaded={handleBookUploaded} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lottie Animation */}
            <motion.div
              className="w-full max-w-sm mx-auto mt-8 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            >
              <h3 className="text-center text-lg font-bold text-gray-800 dark:text-white mb-2">
                Explore Books
              </h3>
              {bookAnimation ? (
                <Lottie animationData={bookAnimation} loop className="w-full h-auto max-h-40" />
              ) : (
                <div className="text-center text-red-500 dark:text-red-400 text-sm">
                  Error: Lottie animation not loaded. Check path.
                </div>
              )}
            </motion.div>
          </section>

          {/* RIGHT - Book Gallery */}
          <section className="lg:w-1/2 flex-grow p-2">
            <BookGallery key={galleryRefreshKey} />
          </section>
        </div>
      </main>
    </div>
  );
}