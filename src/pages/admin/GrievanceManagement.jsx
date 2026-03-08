import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";

const statusColor = (s) => s === "Resolved" ? "bg-green-100 text-green-700" : s === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700";

export default function GrievanceManagement() {
  const [grievances, setGrievances] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("In Progress");

  const fetch = async () => {
    try { const { data } = await api.get("/grievances/all"); setGrievances(data.grievances || []); }
    catch { }
  };

  useEffect(() => { fetch(); }, []);

  const handleReply = async () => {
    try {
      await api.put(`/grievances/${selected._id}`, { status, adminReply: reply });
      toast.success("Reply sent!"); setSelected(null); setReply(""); fetch();
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">😢 Grievance Management</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: grievances.length, color: "text-slate-700 dark:text-white" },
          { label: "Pending", value: grievances.filter(g => g.status === "Pending").length, color: "text-yellow-600" },
          { label: "Resolved", value: grievances.filter(g => g.status === "Resolved").length, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {grievances.map((g, i) => (
          <motion.div key={g._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className="card cursor-pointer hover:shadow-md transition" onClick={() => { setSelected(g); setReply(g.adminReply || ""); setStatus(g.status); }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold dark:text-white">{g.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(g.status)}`}>{g.status}</span>
                </div>
                <p className="text-xs text-slate-500">{g.submittedBy?.name} · {g.category} · {new Date(g.createdAt).toLocaleDateString("en-IN")}</p>
                <p className="text-sm text-slate-500 mt-1 truncate">{g.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-lg font-bold dark:text-white">Reply to Grievance</h2>
                <button onClick={() => setSelected(null)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-xs text-slate-400 mb-1">{selected.submittedBy?.name} · {selected.category}</p>
                  <p className="font-semibold dark:text-white">{selected.subject}</p>
                  <p className="text-sm text-slate-500 mt-1">{selected.description}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Update Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="input">
                    {["Pending","In Progress","Resolved"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Reply</label>
                  <textarea value={reply} onChange={e => setReply(e.target.value)}
                    rows={3} className="input resize-none" placeholder="Student ko reply karo..." />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setSelected(null)} className="btn-secondary">Cancel</button>
                  <button onClick={handleReply} className="btn-primary">Send Reply</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}