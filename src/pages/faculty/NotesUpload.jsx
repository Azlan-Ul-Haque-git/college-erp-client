import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon, TrashIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

const EMPTY = { title: "", subject: "", branch: "CSE", semester: 1, description: "", fileUrl: "", fileType: "PDF" };

export default function NotesUpload() {
  const [notes, setNotes] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchNotes = async () => {
    try { const { data } = await api.get("/notes/my"); setNotes(data.notes || []); }
    catch { }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) { toast.error("File too large! Max 50MB"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(p => ({ ...p, fileUrl: data.url }));
      // Auto detect file type
      const name = file.name.toLowerCase();
      const type = name.endsWith(".pdf") ? "PDF"
        : name.endsWith(".ppt") || name.endsWith(".pptx") ? "PPT"
          : name.endsWith(".mp4") || name.endsWith(".mkv") ? "Video"
            : name.endsWith(".doc") || name.endsWith(".docx") ? "Doc" : "Other";
      setForm(p => ({ ...p, fileType: type }));
      toast.success("File uploaded successfully! ✅");
    } catch {
      toast.error("Upload failed. Check Cloudinary config.");
    } finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fileUrl) { toast.error("Please upload a file first!"); return; }
    setSubmitting(true);
    try {
      await api.post("/notes", form);
      toast.success("Note uploaded!"); setModal(false); setForm(EMPTY); fetchNotes();
    } catch { toast.error("Failed to save note"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/notes/${id}`); toast.success("Deleted!"); fetchNotes(); }
    catch { toast.error("Delete failed"); }
  };

  const typeIcon = (t) => t === "PDF" ? "📄" : t === "Video" ? "🎥" : t === "PPT" ? "📊" : "📝";
  const typeColor = (t) => t === "PDF" ? "bg-red-100 text-red-700" : t === "Video" ? "bg-blue-100 text-blue-700" : t === "PPT" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📚 Study Notes</h1>
          <p className="text-slate-500 text-sm">{notes.length} notes uploaded</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }}
          onClick={() => { setForm(EMPTY); setModal(true); }}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Upload Note
        </motion.button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <div className="card col-span-3 text-center py-12">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-slate-400">No notes uploaded yet. Upload one!</p>
          </div>
        ) : notes.map((n, i) => (
          <motion.div key={n._id}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="card hover:shadow-md transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{typeIcon(n.fileType)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(n.fileType)}`}>
                  {n.fileType}
                </span>
              </div>
              <button onClick={() => handleDelete(n._id)}
                className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{n.title}</h3>
            <p className="text-xs text-slate-500 mb-1">{n.subject} · {n.branch} · Sem {n.semester}</p>
            {n.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{n.description}</p>}
            {n.fileUrl && (
              <a href={n.fileUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium mt-2">
                🔗 Open {n.fileType}
              </a>
            )}
          </motion.div>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-lg font-bold dark:text-white">Upload Study Note</h2>
                <button onClick={() => setModal(false)}>
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* File Upload Area */}
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                    Upload File * (PDF, PPT, Video, Doc — max 50MB)
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${dragOver
                        ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        : form.fileUrl
                          ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                          : "border-slate-200 dark:border-slate-600 hover:border-purple-300"
                      }`}>
                    <input
                      type="file" id="noteFile" className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.mp4,.mkv"
                      onChange={e => handleFileUpload(e.target.files[0])}
                    />
                    {form.fileUrl ? (
                      <div>
                        <p className="text-3xl mb-2">✅</p>
                        <p className="text-sm font-semibold text-green-600">File uploaded successfully!</p>
                        <button type="button"
                          onClick={() => setForm(p => ({ ...p, fileUrl: "" }))}
                          className="text-xs text-red-400 hover:underline mt-1">
                          Remove & re-upload
                        </button>
                      </div>
                    ) : uploading ? (
                      <div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Uploading to cloud...</p>
                      </div>
                    ) : (
                      <label htmlFor="noteFile" className="cursor-pointer block">
                        <CloudArrowUpIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Drag & drop or <span className="text-purple-600">browse</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">PDF, PPT, DOCX, MP4 supported</p>
                      </label>
                    )}
                  </div>
                </div>

                {/* Title & Subject */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Title *</label>
                    <input type="text" value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                      required className="input" placeholder="e.g. Unit 1 Notes" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Subject *</label>
                    <input type="text" value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      required className="input" placeholder="e.g. DBMS" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Description</label>
                  <textarea value={form.description}
                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    rows={2} className="input resize-none" placeholder="What's covered in this note..." />
                </div>

                {/* Branch / Semester / Type */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Type</label>
                    <select value={form.fileType}
                      onChange={e => setForm(p => ({ ...p, fileType: e.target.value }))}
                      className="input">
                      {["PDF", "PPT", "Video", "Doc", "Other"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Branch</label>
                    <select value={form.branch}
                      onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}
                      className="input">
                      {["ALL", "CSE", "IT", "ECE", "EE", "ME", "CE"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Semester</label>
                    <select value={form.semester}
                      onChange={e => setForm(p => ({ ...p, semester: +e.target.value }))}
                      className="input">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting || uploading || !form.fileUrl}
                    className="btn-primary disabled:opacity-50">
                    {submitting ? "Saving..." : "Upload Note"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}