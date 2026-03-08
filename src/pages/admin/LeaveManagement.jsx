import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const statusColor = (s) => s === "Approved" ? "bg-green-100 text-green-700" : s === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try { const { data } = await api.get("/leaves/all"); setLeaves(data.leaves || []); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      toast.success(`Leave ${status}!`); fetch();
    } catch { toast.error("Failed"); }
  };

  const pending = leaves.filter(l => l.status === "Pending");
  const approved = leaves.filter(l => l.status === "Approved");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🏖️ Leave Management</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: leaves.length, color: "text-slate-700 dark:text-white" },
          { label: "Pending", value: pending.length, color: "text-yellow-600" },
          { label: "Approved", value: approved.length, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Applicant", "Type", "From", "To", "Days", "Reason", "Status", "Action"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? <tr><td colSpan={8} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : leaves.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-slate-400">No leaves found</td></tr>
              : leaves.map((l, i) => {
                const days = Math.ceil((new Date(l.toDate) - new Date(l.fromDate)) / (1000*60*60*24)) + 1;
                return (
                  <motion.tr key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium dark:text-white">{l.appliedBy?.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{l.leaveType}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(l.fromDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(l.toDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-slate-500">{days}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{l.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColor(l.status)}`}>{l.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      {l.status === "Pending" && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(l._id, "Approved")}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200">✅</button>
                          <button onClick={() => updateStatus(l._id, "Rejected")}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">❌</button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}