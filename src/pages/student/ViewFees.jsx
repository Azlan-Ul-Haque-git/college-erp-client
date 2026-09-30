import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export default function ViewFees() {
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api.get("/fees/my-fees")
      .then((r) => {
        // Backend ab single object bhej raha hai
        setFees(r.data.fees || null);
      })
      .catch((err) => {
        console.error("Fees fetch error:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async () => {
    setPaying(true);
    try {
      toast.success("Payment gateway coming soon! Contact admin.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">Loading fees...</p>
      </div>
    );
  }

  // Agar koi fee record nahi hai
  if (!fees) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          My Fees
        </h1>
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-slate-400">
            No fee record found. Please contact admin.
          </p>
        </div>
      </div>
    );
  }

  const statusColor =
    fees.status === "Paid"
      ? "badge-green"
      : fees.status === "Partial"
        ? "badge-yellow"
        : "badge-red";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        My Fees
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Fee",
            value: `₹${(fees.totalAmount || 0).toLocaleString()}`,
            color: "text-slate-700 dark:text-white",
          },
          {
            label: "Amount Paid",
            value: `₹${(fees.paidAmount || 0).toLocaleString()}`,
            color: "text-emerald-600",
          },
          {
            label: "Amount Due",
            value: `₹${(fees.dueAmount || 0).toLocaleString()}`,
            color: "text-red-500",
          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card text-center"
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Payment Status Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">
            Payment Status
          </h3>
          <span className={`font-semibold px-3 py-1 rounded-full text-sm ${statusColor}`}>
            {fees.status || "Unpaid"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-slate-400 text-xs">Semester</p>
            <p className="font-semibold dark:text-white">
              Sem {fees.semester || "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Academic Year</p>
            <p className="font-semibold dark:text-white">
              {fees.academicYear || "—"}
            </p>
          </div>
          {fees.dueDate && (
            <div>
              <p className="text-slate-400 text-xs">Due Date</p>
              <p className="font-semibold dark:text-white">
                {new Date(fees.dueDate).toLocaleDateString("en-IN")}
              </p>
            </div>
          )}
        </div>

        {fees.status !== "Paid" && fees.dueAmount > 0 && (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePay}
            disabled={paying}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            💳 {paying ? "Processing..." : `Pay ₹${(fees.dueAmount || 0).toLocaleString()} Now`}
          </motion.button>
        )}

        {fees.status === "Paid" && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
            ✅ All fees paid for this semester!
          </div>
        )}
      </div>

      {/* Transaction History (if exists) */}
      {fees.transactions && fees.transactions.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
            Transaction History
          </h3>
          <div className="space-y-2">
            {fees.transactions.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium dark:text-white">
                    ₹{(t.amount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—"}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${t.status === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {t.status || "unknown"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}