import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

const EMPTY = { title: "", description: "", subject: "", branch: "CSE", semester: 1, dueDate: "", fileUrl: "" };

export default function AssignmentManager() {
  const [assignments, setAssignments] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try { const { data } = await api.get("/assignments/my"); setAssignments(data.assignments || []); }
    catch { toast.error("Failed to load"); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("/assignments", form);
      toast.success("Assignment created!"); setModal(false); fetch();
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await api.delete(`/assignments/${id}`);
    toast.success("Deleted"); fetch();
  };

  const isOverdue = (date) => date && new Date(date) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📝 Assignments</h1>
          <p className="text-slate-500 text-sm">{assignments.length} assignments created</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setForm(EMPTY); setModal(true); }}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New Assignment
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.length === 0 ? (
          <div className="card col-span-2 text-center py-12">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-slate-400">Koi assignment nahi hai — naya banao!</p>
          </div>
        ) : assignments.map((a, i) => (
          <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 dark:text-white">{a.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{a.subject} · {a.branch} · Sem {a.semester}</p>
              </div>
              <button onClick={() => handleDelete(a._id)}
                className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg ml-2">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            {a.description && <p className="text-sm text-slate-500 mb-3">{a.description}</p>}
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${isOverdue(a.dueDate) ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                {a.dueDate ? `Due: ${new Date(a.dueDate).toLocaleDateString("en-IN")}` : "No deadline"}
              </span>
              {a.fileUrl && (
                <a href={a.fileUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-purple-600 hover:underline">📎 Attachment</a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-lg font-bold dark:text-white">New Assignment</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[
                  { label: "Title *", name: "title", type: "text", required: true },
                  { label: "Subject *", name: "subject", type: "text", required: true },
                  { label: "Description", name: "description", type: "text" },
                  { label: "File URL (optional)", name: "fileUrl", type: "url" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{f.label}</label>
                    <input type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                      required={f.required} className="input" placeholder={f.label} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Branch</label>
                    <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} className="input">
                      {["ALL", "CSE", "IT", "ECE", "EE", "ME", "CE"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Semester</label>
                    <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: +e.target.value }))} className="input">
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="input" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Creating..." : "Create Assignment"}
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