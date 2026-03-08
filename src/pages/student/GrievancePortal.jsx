import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const EMPTY = { category: "Academic", subject: "", description: "" };
const statusColor = (s) => s === "Resolved" ? "bg-green-100 text-green-700" : s === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";
const catIcon = (c) => c === "Academic" ? "📚" : c === "Infrastructure" ? "🏗️" : c === "Fee" ? "💰" : c === "Harassment" ? "🚨" : "📝";

export default function GrievancePortal() {
  const [grievances, setGrievances] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try { const { data } = await api.get("/grievances/my"); setGrievances(data.grievances || []); }
    catch { }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("/grievances", form);
      toast.success("Grievance submitted!"); setModal(false); fetch();
    } catch { toast.error("Failed to submit"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">😢 Grievance Portal</h1>
          <p className="text-slate-500 text-sm">Submit your grievances here</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setForm(EMPTY); setModal(true); }}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> New Grievance
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: grievances.length, color: "text-slate-700 dark:text-white" },
          { label: "Pending", value: grievances.filter(g => g.status === "Pending").length, color: "text-yellow-600" },
          { label: "Resolved", value: grievances.filter(g => g.status === "Resolved").length, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {grievances.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">😊</p>
            <p className="text-slate-400">No grievances submitted yet</p>
          </div>
        ) : grievances.map((g, i) => (
          <motion.div key={g._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{catIcon(g.category)}</span>
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{g.subject}</h3>
                  <p className="text-xs text-slate-400">{g.category} · {new Date(g.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(g.status)}`}>{g.status}</span>
            </div>
            <p className="text-sm text-slate-500">{g.description}</p>
            {g.adminReply && (
              <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="text-xs font-semibold text-purple-600 mb-1">Admin Reply:</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{g.adminReply}</p>
              </div>
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
                <h2 className="text-lg font-bold dark:text-white">Submit Grievance</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input">
                    {["Academic", "Infrastructure", "Fee", "Harassment", "Other"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Subject *</label>
                  <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    required className="input" placeholder="Subject of Grevience" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Description *</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    required rows={4} className="input resize-none" placeholder="Describe your grievance in detail..." />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Submitting..." : "Submit Grievance"}
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