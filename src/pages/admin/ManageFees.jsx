import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";

const EMPTY = { student: "", totalAmount: "", paidAmount: "0", semester: "1", academicYear: "2024-25", dueDate: "" };

export default function ManageFees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchFees = useCallback(async () => {
    try {
      const { data } = await api.get("/fees");
      setFees(data.fees || []);
    } catch { toast.error("Failed to load fees"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchFees();
    api.get("/students").then(r => setStudents(r.data.students || [])).catch(() => { });
  }, [fetchFees]);

  const totalCollected = fees.reduce((a, f) => a + (f.paidAmount || 0), 0);
  const totalDue = fees.reduce((a, f) => a + (f.dueAmount || 0), 0);
  const partialCount = fees.filter(f => f.status === "Partial").length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const total = +form.totalAmount;
      const paid = +form.paidAmount;
      const due = total - paid;
      const status = due <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
      const payload = { ...form, totalAmount: total, paidAmount: paid, dueAmount: due, status };

      if (editing) {
        await api.put(`/fees/${editing}`, payload);
        toast.success("Fee record updated!");
      } else {
        await api.post("/fees", payload);
        toast.success("Fee record added!");
      }
      setModal(false);
      fetchFees();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this fee record?")) return;
    try {
      await api.delete(`/fees/${id}`);
      toast.success("Deleted!");
      fetchFees();
    } catch { toast.error("Delete failed"); }
  };

  const statusColor = (s) =>
    s === "Paid" ? "bg-green-100 text-green-700" :
      s === "Partial" ? "bg-yellow-100 text-yellow-700" :
        "bg-red-100 text-red-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Fee Management</h1>
          <p className="text-slate-500 text-sm">{fees.length} fee records</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setEditing(null); setForm(EMPTY); setModal(true); }}
          className="btn-primary flex items-center gap-2 self-start">
          <PlusIcon className="w-4 h-4" /> Add Fee Record
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", value: `₹${totalCollected.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Total Due", value: `₹${totalDue.toLocaleString()}`, color: "text-red-500" },
          { label: "Partial Payments", value: partialCount, color: "text-yellow-500" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Student", "Roll No", "Total", "Paid", "Due", "Status", "Semester", "Action"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400">No fee records — click "Add Fee Record" to add!</td></tr>
              ) : fees.map((f, i) => (
                <motion.tr key={f._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{f.student?.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{f.student?.rollNo || "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{f.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold">₹{f.paidAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-500 font-semibold">₹{f.dueAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(f.status)}`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">Sem {f.semester}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditing(f._id);
                        setForm({ student: f.student?._id || "", totalAmount: f.totalAmount, paidAmount: f.paidAmount, semester: f.semester, academicYear: f.academicYear, dueDate: f.dueDate?.split("T")[0] || "" });
                        setModal(true);
                      }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(f._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{editing ? "Edit Fee Record" : "Add Fee Record"}</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Select Student *</label>
                  <select value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} required className="input">
                    <option value="">-- Select Student --</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.user?.name} — {s.rollNo} ({s.branch})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Total Amount (₹) *</label>
                    <input type="number" value={form.totalAmount} onChange={e => setForm(p => ({ ...p, totalAmount: e.target.value }))} required className="input" placeholder="45000" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Paid Amount (₹)</label>
                    <input type="number" value={form.paidAmount} onChange={e => setForm(p => ({ ...p, paidAmount: e.target.value }))} className="input" placeholder="0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Semester *</label>
                    <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))} className="input">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Academic Year</label>
                    <input type="text" value={form.academicYear} onChange={e => setForm(p => ({ ...p, academicYear: e.target.value }))} className="input" placeholder="2024-25" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="input" />
                </div>

                {form.totalAmount && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-sm">
                    <p className="text-slate-600 dark:text-slate-300">
                      Due Amount: <span className="font-bold text-red-500">₹{(+form.totalAmount - +form.paidAmount).toLocaleString()}</span>
                      {" · "}Status: <span className={`font-bold ${(+form.totalAmount - +form.paidAmount) <= 0 ? "text-green-600" : +form.paidAmount > 0 ? "text-yellow-600" : "text-red-600"}`}>
                        {(+form.totalAmount - +form.paidAmount) <= 0 ? "Paid" : +form.paidAmount > 0 ? "Partial" : "Unpaid"}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Saving..." : editing ? "Update" : "Add Fee"}
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