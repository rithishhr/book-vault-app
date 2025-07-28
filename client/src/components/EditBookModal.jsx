import { useState } from "react";
import axios from "axios";

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
      const res = await axios.put(`http://localhost:5000/api/books/${book._id}`, formData);
      showToast("✅ Book updated!", "success");
      onUpdate();
      onClose();
    } catch {
      showToast("❌ Update failed", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleUpdate} className="bg-white dark:bg-zinc-900 p-6 rounded-xl w-[90%] max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-300">✏️ Edit Book</h2>
        <input
          className="w-full p-3 rounded-lg border mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <input
          className="w-full p-3 rounded-lg border mb-3"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
        />
        <textarea
          className="w-full p-3 rounded-lg border mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
        <input
          type="file"
          onChange={(e) => setCover(e.target.files[0])}
          className="mb-4"
          accept="image/jpeg,image/png"
        />
        <div className="flex justify-between">
          <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
            Update
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Cancel</button>
        </div>
      </form>
    </div>
  );
}
