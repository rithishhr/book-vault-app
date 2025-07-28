import { useState } from "react";
import axios from "axios";
import BASE_URL from "../services/api";

export default function EditBookModal({ book, onClose, onUpdate, showToast }) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description);
  const [cover, setCover] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("description", description);
    if (cover) formData.append("coverImage", cover);

    try {
      await axios.put(`${BASE_URL}/api/books/${book._id}`, formData);
      showToast("✅ Book updated!", "success");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      showToast("❌ Update failed", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleUpdate}
        className="bg-white dark:bg-zinc-900 p-6 rounded-xl w-[90%] max-w-lg shadow-lg space-y-4"
      >
        <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300">
          ✏️ Edit Book
        </h2>

        <input
          type="text"
          required
          className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />

        <input
          type="text"
          required
          className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
        />

        <textarea
          required
          rows="4"
          className="w-full p-3 rounded-lg border dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 dark:text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />

        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => setCover(e.target.files[0])}
          className="w-full text-sm text-gray-600 dark:text-gray-300"
        />

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow-sm"
          >
            Update
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
