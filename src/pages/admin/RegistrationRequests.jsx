import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const statusColor = (s) =>
  s === "Approved" ? "bg-green-100 text-green-700" :
  s === "Rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

export default function RegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");

  const fetchData = async () => {
    try { const { data } = await api.get("/registrations"); setRequests(data.registrations || []); }
    catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try { await api.put(`/registrations/${id}/approve`); toast.success("Approved! User can now login."); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleReject = async (id) => {
    try { await api.put(`/registrations/${id}/reject`, { remarks: "Not approved by admin" }); toast.success("Rejected"); fetchData(); }
    catch { toast.error("Failed"); }
  };

  const filtered = requests.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📋 Registration Requests</h1>
        <p className="text-slate-500 text-sm">{requests.filter(r => r.status === "Pending").length} pending approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: requests.filter(r => r.status === "Pending").length, color: "text-yellow-600" },
          { label: "Approved", value: requests.filter(r => r.status === "Approved").length, color: "text-green-600" },
          { label: "Rejected", value: requests.filter(r => r.status === "Rejected").length, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="card text-center cursor-pointer" onClick={() => setFilter(s.label)}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["Pending","Approved","Rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${filter === f ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? <p className="text-center text-slate-400 py-8">Loading...</p>
      : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400">No {filter.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold dark:text-white">{r.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(r.status)}`}>{r.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.role === "student" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {r.role}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{r.email} · {r.phone}</p>
                  {r.role === "student" && (
                    <p className="text-xs text-slate-400 mt-1">
                      {r.branch} · Sem {r.semester} · Year {r.year} · {r.rollNo}
                    </p>
                  )}
                  {r.role === "faculty" && (
                    <p className="text-xs text-slate-400 mt-1">
                      {r.department} · {r.designation}
                    </p>
                  )}
                  <p className="text-xs text-slate-300 mt-1">
                    Applied: {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                {r.status === "Pending" && (
                  <div className="flex gap-2 ml-3">
                    <button onClick={() => handleApprove(r._id)}
                      className="p-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleReject(r._id)}
                      className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}