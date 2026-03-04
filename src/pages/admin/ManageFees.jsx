import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export default function ManageFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/fees").then(r => setFees(r.data.fees || [])).catch(() => toast.error("Failed to load fees")).finally(() => setLoading(false));
  }, []);

  const statusColor = (s) => s==="Paid"?"badge-green":s==="Partial"?"badge-yellow":"badge-red";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Fee Management</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:"Total Collected", value:"₹4,80,000", color:"text-emerald-600" },
          { label:"Pending Amount",  value:"₹1,20,000", color:"text-red-500" },
          { label:"Partial Paid",    value:"₹60,000",   color:"text-yellow-500" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Student","Roll No","Total","Paid","Due","Status","Semester"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : fees.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-slate-400">No fee records found</td></tr>
              : fees.map((f,i) => (
                <motion.tr key={f._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{f.student?.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{f.student?.rollNo || "—"}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹{f.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-600">₹{f.paidAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-500">₹{f.dueAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={statusColor(f.status)}>{f.status}</span></td>
                  <td className="px-4 py-3 text-slate-500">Sem {f.semester}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
