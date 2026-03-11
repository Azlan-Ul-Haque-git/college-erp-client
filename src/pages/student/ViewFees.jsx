import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export default function ViewFees() {
  const [fees, setFees] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get("/fees/my-fees").then(r => setFees(r.data.fees || null)).catch(() => { });
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      toast.success("Payment gateway coming soon! Contact admin for payment.");
    } finally { setPaying(false); }
  };


  const mock = { totalAmount: 45000, paidAmount: 45000, dueAmount: 0, status: "Paid", semester: 5, academicYear: "2024-25" };
  const f = fees || mock;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Fees</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Fee", value: `₹${f.totalAmount?.toLocaleString()}`, color: "text-slate-700 dark:text-white" },
          { label: "Amount Paid", value: `₹${f.paidAmount?.toLocaleString()}`, color: "text-emerald-600" },
          { label: "Amount Due", value: `₹${f.dueAmount?.toLocaleString()}`, color: "text-red-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card text-center">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Payment Status</h3>
          <span className={`font-semibold px-3 py-1 rounded-full text-sm ${f.status === "Paid" ? "badge-green" : f.status === "Partial" ? "badge-yellow" : "badge-red"}`}>{f.status}</span>
        </div>
        <p className="text-sm text-slate-500">Semester {f.semester} · {f.academicYear}</p>
        {f.status !== "Paid" && (
          <motion.button whileTap={{ scale: 0.98 }} onClick={handlePay} disabled={paying}
            className="btn-primary mt-4 flex items-center gap-2">
            💳 {paying ? "Processing..." : `Pay ₹${f.dueAmount?.toLocaleString()} Now`}
          </motion.button>
        )}
        {f.status === "Paid" && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
            ✅ All fees paid for this semester!
          </div>
        )}
      </div>
    </div>
  );
}
