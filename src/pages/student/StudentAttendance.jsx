import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axiosInstance";

const fmt = d => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN") : "—";

const STATUS = {
  present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  absent: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  late: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  pending: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
};
const APPROVAL = {
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  not_required: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
};

export default function StudentAttendance() {
  const { user } = useAuth();

  const [today, setToday] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const refresh = async () => {
    try {
      const [s, r] = await Promise.all([
        api.get("/attendance/my-status"),
        api.get("/attendance"),
      ]);
      setToday(s.data.data || null);
      setRecords(r.data.data || []);
    } catch {/* silently ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const checkIn = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/attendance/checkin");
      setToday(data.data);
      showToast("✅ Checked in! Awaiting admin approval.");
    } catch (e) {
      showToast(e.response?.data?.message || "Check-in failed", false);
    } finally { setActionLoading(false); }
  };

  const checkOut = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/attendance/checkout");
      setToday(data.data);
      showToast("✅ Checked out!");
    } catch (e) {
      showToast(e.response?.data?.message || "Check-out failed", false);
    } finally { setActionLoading(false); }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const total = records.length;
  const present = records.filter(r => r.status === "present").length;
  const absent = records.filter(r => r.status === "absent").length;
  const late = records.filter(r => r.status === "late").length;
  const pct = total ? Math.round((present / total) * 100) : 0;

  const checkedIn = !!today?.checkIn?.time;
  const checkedOut = !!today?.checkOut?.time;
  const approval = today?.approvalStatus;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400">
        Loading attendance…
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-3xl mx-auto px-2 sm:px-0">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
              ${toast.ok ? "bg-emerald-500" : "bg-red-500"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page title */}
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
        📅 My Attendance
      </h1>

      {/* ── Check-in / Check-out card ─────────────────────────────────────── */}
      <div className="card space-y-4">
        {/* Date + approval badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
            Today — {fmtDate(new Date())}
          </p>
          {approval && approval !== "not_required" && (
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${APPROVAL[approval] || ""}`}>
              {approval === "pending" && "⏳ Pending approval"}
              {approval === "approved" && "✅ Approved"}
              {approval === "rejected" && "❌ Rejected"}
            </span>
          )}
        </div>

        {/* Times row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <TimeBlock label="Check-in" value={checkedIn ? fmt(today.checkIn.time) : "—"} active={checkedIn} color="text-emerald-500" />
          <span className="text-slate-300 dark:text-slate-600 text-xl hidden sm:block">→</span>
          <TimeBlock label="Check-out" value={checkedOut ? fmt(today.checkOut.time) : "—"} active={checkedOut} color="text-violet-500" />
          {today?.workingHours && (
            <>
              <span className="text-slate-300 dark:text-slate-600 text-xl hidden sm:block">·</span>
              <TimeBlock label="Hours" value={`${today.workingHours}h`} active color="text-amber-500" />
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={checkedIn || actionLoading}
            onClick={checkIn}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all
              ${checkedIn
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default"
                : "bg-emerald-500 hover:bg-emerald-600 text-white"
              } disabled:opacity-60`}
          >
            {actionLoading && !checkedIn ? "…" : checkedIn ? "✅ Checked In" : "🟢 Check In"}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!checkedIn || checkedOut || actionLoading}
            onClick={checkOut}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all
              ${checkedOut
                ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 cursor-default"
                : !checkedIn
                  ? "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed"
                  : "bg-violet-500 hover:bg-violet-600 text-white"
              } disabled:opacity-60`}
          >
            {actionLoading && checkedIn && !checkedOut ? "…" : checkedOut ? "✅ Checked Out" : "🔴 Check Out"}
          </motion.button>
        </div>

        {/* Rejection reason */}
        {approval === "rejected" && today?.rejectionReason && (
          <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-3 py-2 rounded-lg">
            Rejection reason: {today.rejectionReason}
          </p>
        )}
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 130px), 1fr))" }}
      >
        {[
          { label: "Total", value: total, icon: "📚", cls: "text-slate-800 dark:text-white" },
          { label: "Present", value: present, icon: "✅", cls: "text-emerald-600 dark:text-emerald-400" },
          { label: "Absent", value: absent, icon: "❌", cls: "text-red-500 dark:text-red-400" },
          { label: "Late", value: late, icon: "⏰", cls: "text-amber-600 dark:text-amber-400" },
        ].map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-3 px-2"
          >
            <p className="text-xl mb-0.5">{s.icon}</p>
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Attendance % progress bar */}
      <div className="card space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Overall Attendance</span>
          <span className={`font-bold ${pct >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`h-full rounded-full ${pct >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
          />
        </div>
        {pct < 75 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20
                        px-3 py-2 rounded-lg">
            ⚠️ Below 75%. Need {Math.ceil((0.75 * total - present) / 0.25)} more present days.
          </p>
        )}
      </div>

      {/* ── History table ─────────────────────────────────────────────────── */}
      <div className="card overflow-hidden p-0">
        <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200 p-4 border-b
                        border-slate-100 dark:border-slate-700">
          Attendance History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[480px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {["Date", "Subject", "Status", "Check-in", "Check-out", "Approval"].map(h => (
                  <th key={h} className="px-3 sm:px-4 py-2.5 text-left font-semibold
                                          text-slate-400 dark:text-slate-500 uppercase text-xs tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    No attendance records yet
                  </td>
                </tr>
              ) : records.map((r, i) => (
                <tr key={r._id || i}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-3 sm:px-4 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {fmtDate(r.date)}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {r.subject || r.course || "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                      ${STATUS[r.status] || STATUS.pending}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {r.checkIn?.time ? fmt(r.checkIn.time) : "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {r.checkOut?.time ? fmt(r.checkOut.time) : "—"}
                  </td>
                  <td className="px-3 sm:px-4 py-2.5">
                    {r.approvalStatus && r.approvalStatus !== "not_required" ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                        ${APPROVAL[r.approvalStatus] || ""}`}>
                        {r.approvalStatus}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────
function TimeBlock({ label, value, active, color }) {
  return (
    <div className="flex flex-col items-center min-w-[56px]">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{label}</p>
      <p className={`font-bold mt-0.5 ${active ? color : "text-slate-300 dark:text-slate-600"}
                    text-lg sm:text-xl`}>
        {value}
      </p>
    </div>
  );
}