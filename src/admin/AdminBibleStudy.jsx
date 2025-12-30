import { useEffect, useState } from "react";
import axios from "axios";

// Load base URL from .env (Create React App requires REACT_APP_ prefix)
const API_BASE_URL = import.meta.env.REACT_APP_API_URL;

const API = `${API_BASE_URL}/api/studies`;
const BASE_URL = API_BASE_URL;

const emptyForm = {
  _id: null,
  title: "",
  description: "",
  category: "topical",
  imageUrl: "",
};

export default function AdminStudies() {
  const [studies, setStudies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  /* ================= FETCH ================= */
  const fetchStudies = async () => {
    try {
      const res = await axios.get(API);
      setStudies(res.data.studies || []);
    } catch {
      alert("Failed to load studies");
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async () => {
    if (!image) return alert("Select an image first");

    const data = new FormData();
    data.append("image", image);

    setUploading(true);
    try {
      const res = await axios.post(`${API}/upload-image`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setForm((prev) => ({
        ...prev,
        imageUrl: res.data.imageUrl,
      }));
    } catch {
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= CREATE / UPDATE ================= */
  const saveStudy = async () => {
    if (!form.title || !form.description) {
      return alert("Title and description are required");
    }

    setLoading(true);
    try {
      if (form._id) {
        await axios.put(`${API}/${form._id}`, form);
      } else {
        await axios.post(API, form);
      }

      setForm(emptyForm);
      setImage(null);
      fetchStudies();
    } catch (err) {
      alert(err.response?.data?.error || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const editStudy = (study) => {
    setForm({
      _id: study._id,
      title: study.title,
      description: study.description,
      category: study.category,
      imageUrl: study.imageUrl || "",
    });
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const deleteStudy = async (id) => {
    if (!confirm("Delete this study permanently?")) return;
    await axios.delete(`${API}/${id}`);
    fetchStudies();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin • Studies</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= FORM ================= */}
        <div className="bg-white shadow-lg rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">
            {form._id ? "Edit Study" : "Create Study"}
          </h2>

          <input
            className="w-full border rounded px-3 py-2 mb-3"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="w-full border rounded px-3 py-2 mb-3 h-28"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <select
            className="w-full border rounded px-3 py-2 mb-3"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="topical">Topical</option>
            <option value="gospels">Gospels</option>
            <option value="epistles">Epistles</option>
            <option value="old_testament">Old Testament</option>
            <option value="new_testament">New Testament</option>
          </select>

          <input
            type="file"
            accept="image/*"
            className="mb-2"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button
            onClick={uploadImage}
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 rounded mb-3 hover:bg-blue-700"
          >
            {uploading ? "Uploading..." : "Upload Image"}
          </button>

          {form.imageUrl && (
            <img
              src={`${BASE_URL}${form.imageUrl}`}
              className="w-full h-40 object-cover rounded mb-3 border"
              alt="Preview"
            />
          )}

          <button
            onClick={saveStudy}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save Study"}
          </button>

          {form._id && (
            <button
              onClick={() => setForm(emptyForm)}
              className="w-full mt-2 bg-gray-400 text-white py-2 rounded"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* ================= LIST ================= */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Existing Studies</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {studies.map((study) => (
              <div
                key={study._id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                {study.imageUrl && (
                  <img
                    src={`${BASE_URL}${study.imageUrl}`}
                    className="w-full h-40 object-cover"
                    alt={study.title}
                  />
                )}

                <div className="p-4">
                  <h3 className="font-semibold text-lg">{study.title}</h3>

                  <p className="text-sm text-gray-500 mb-3">{study.category}</p>

                  <div className="flex justify-between">
                    <button
                      onClick={() => editStudy(study)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStudy(study._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {studies.length === 0 && (
            <p className="text-gray-500 mt-6">No studies found.</p>
          )}
        </div>
      </div>
    </div>
  );
}