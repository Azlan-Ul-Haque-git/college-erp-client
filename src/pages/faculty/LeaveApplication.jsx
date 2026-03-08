import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

const EMPTY = { leaveType: "Casual", fromDate: "", toDate: "", reason: "" };
const statusColor = (s) => s === "Approved" ? "bg-green-100 text-green-700" : s === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

export default function LeaveApplication() {
  const [leaves, setLeaves] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try { const { data } = await api.get("/leaves/my"); setLeaves(data.leaves || []); }
    catch { }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("/leaves", form);
      toast.success("Leave applied!"); setModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const days = (from, to) => {
    if (!from || !to) return 0;
    return Math.ceil((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🏖️ Leave Application</h1>
          <p className="text-slate-500 text-sm">{leaves.length} applications</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setForm(EMPTY); setModal(true); }}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Apply Leave
        </motion.button>
      </div>

      <div className="space-y-3">
        {leaves.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">🏖️</p>
            <p className="text-slate-400">Koi leave application nahi hai</p>
          </div>
        ) : leaves.map((l, i) => (
          <motion.div key={l._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800 dark:text-white">{l.leaveType} Leave</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(l.status)}`}>{l.status}</span>
                </div>
                <p className="text-sm text-slate-500">{l.reason}</p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(l.fromDate).toLocaleDateString("en-IN")} → {new Date(l.toDate).toLocaleDateString("en-IN")}
                  {" · "}{days(l.fromDate, l.toDate)} days
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-lg font-bold dark:text-white">Apply Leave</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Leave Type</label>
                  <select value={form.leaveType} onChange={e => setForm(p => ({ ...p, leaveType: e.target.value }))} className="input">
                    {["Casual", "Sick", "Emergency", "Other"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">From Date *</label>
                    <input type="date" value={form.fromDate} onChange={e => setForm(p => ({ ...p, fromDate: e.target.value }))} required className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">To Date *</label>
                    <input type="date" value={form.toDate} onChange={e => setForm(p => ({ ...p, toDate: e.target.value }))} required className="input" />
                  </div>
                </div>
                {form.fromDate && form.toDate && (
                  <p className="text-sm text-purple-600 font-medium">
                    Total: {days(form.fromDate, form.toDate)} days
                  </p>
                )}
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Reason *</label>
                  <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                    required rows={3} className="input resize-none" placeholder="Leave ka reason..." />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Applying..." : "Apply Leave"}
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