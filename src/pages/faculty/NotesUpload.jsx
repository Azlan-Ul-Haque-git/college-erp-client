import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

const EMPTY = { title: "", subject: "", branch: "CSE", semester: 1, description: "", fileUrl: "", fileType: "PDF" };

export default function NotesUpload() {
  const [notes, setNotes] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try { const { data } = await api.get("/notes/my"); setNotes(data.notes || []); }
    catch { }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("/notes", form);
      toast.success("Note uploaded!"); setModal(false); fetch();
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const typeIcon = (t) => t === "PDF" ? "📄" : t === "Video" ? "🎥" : t === "PPT" ? "📊" : "📝";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📚 Study Notes</h1>
          <p className="text-slate-500 text-sm">{notes.length} notes uploaded</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setForm(EMPTY); setModal(true); }}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Upload Note
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <div className="card col-span-3 text-center py-12">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-slate-400">No notes uploaded yet.Upload one!</p>
          </div>
        ) : notes.map((n, i) => (
          <motion.div key={n._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }} className="card hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{typeIcon(n.fileType)}</span>
              <button onClick={async () => { await api.delete(`/notes/${n._id}`); fetch(); }}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-1">{n.title}</h3>
            <p className="text-xs text-slate-500 mb-2">{n.subject} · {n.branch} · Sem {n.semester}</p>
            {n.description && <p className="text-xs text-slate-400 mb-3">{n.description}</p>}
            {n.fileUrl && (
              <a href={n.fileUrl} target="_blank" rel="noreferrer"
                className="text-xs text-purple-600 hover:underline font-medium">
                🔗 Open {n.fileType}
              </a>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-lg font-bold dark:text-white">Upload Study Note</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[
                  { label: "Title *", name: "title", required: true },
                  { label: "Subject *", name: "subject", required: true },
                  { label: "Description", name: "description" },
                  { label: "File URL (Drive/Dropbox link)", name: "fileUrl", type: "url" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{f.label}</label>
                    <input type={f.type || "text"} value={form[f.name]}
                      onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      required={f.required} className="input" placeholder={f.label} />
                  </div>
                ))}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Type</label>
                    <select value={form.fileType} onChange={e => setForm(p => ({ ...p, fileType: e.target.value }))} className="input">
                      {["PDF", "PPT", "Video", "Doc", "Other"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Branch</label>
                    <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} className="input">
                      {["ALL", "CSE", "IT", "ECE", "EE", "ME", "CE"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Semester</label>
                    <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: +e.target.value }))} className="input">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Uploading..." : "Upload Note"}
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