import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";

const fmt = d => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN") : "—";

export default function AttendanceApprovals() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [toast, setToast] = useState(null);
    const [rejectId, setRejectId] = useState(null);
    const [reason, setReason] = useState("");
    const [actioning, setActioning] = useState(null);   // id currently being actioned

    const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

    const fetchPending = async () => {
        try {
            const { data } = await api.get("/attendance/pending-approvals");
            setRecords(data.data || []);
        } catch { showToast("Failed to load approvals", false); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchPending(); }, []);

    // ── Approve ───────────────────────────────────────────────────────────────
    const approve = async id => {
        setActioning(id);
        try {
            await api.patch(`/attendance/${id}/approve`, { action: "approve" });
            setRecords(p => p.filter(r => r._id !== id));
            showToast("✅ Attendance approved");
        } catch { showToast("Approval failed", false); }
        finally { setActioning(null); }
    };

    // ── Reject ────────────────────────────────────────────────────────────────
    const reject = async () => {
        if (!rejectId) return;
        setActioning(rejectId);
        try {
            await api.patch(`/attendance/${rejectId}/approve`, { action: "reject", reason });
            setRecords(p => p.filter(r => r._id !== rejectId));
            setRejectId(null);
            setReason("");
            showToast("Attendance rejected");
        } catch { showToast("Rejection failed", false); }
        finally { setActioning(null); }
    };

    // ── Bulk approve ──────────────────────────────────────────────────────────
    const bulkApprove = async () => {
        if (!window.confirm(`Approve all ${filtered.length} pending records?`)) return;
        try {
            const { data } = await api.post("/attendance/bulk-approve");
            setRecords([]);
            showToast(data.message || "All approved");
        } catch { showToast("Bulk approval failed", false); }
    };

    const filtered = records.filter(r =>
        filter === "all" ? true : r.userType === filter
    );
    const stuCount = records.filter(r => r.userType === "student").length;
    const facCount = records.filter(r => r.userType === "faculty").length;

    if (loading) {
        return <div className="flex items-center justify-center h-40 text-slate-400">Loading…</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-6 w-full max-w-5xl mx-auto px-2 sm:px-0">

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                        className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
              ${toast.ok ? "bg-emerald-500" : "bg-red-500"}`}>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reject modal */}
            <AnimatePresence>
                {rejectId && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Reject Attendance</h3>
                            <p className="text-sm text-slate-400">Provide a reason (optional)</p>
                            <textarea
                                rows={3} value={reason} onChange={e => setReason(e.target.value)}
                                placeholder="Enter rejection reason…"
                                className="input-field resize-none w-full"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => { setRejectId(null); setReason(""); }}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600
                             text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50
                             dark:hover:bg-slate-700 transition-all">
                                    Cancel
                                </button>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={reject}
                                    disabled={!!actioning}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white
                             font-semibold text-sm transition-all disabled:opacity-60">
                                    {actioning ? "…" : "Confirm Reject"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
                        ✅ Attendance Approvals
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {filtered.length} pending request{filtered.length !== 1 ? "s" : ""}
                    </p>
                </div>
                {filtered.length > 0 && (
                    <motion.button whileTap={{ scale: 0.97 }} onClick={bulkApprove}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5
                       rounded-xl font-semibold text-sm transition-all flex-shrink-0">
                        ✅ Approve All ({filtered.length})
                    </motion.button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {[
                    { key: "all", label: `All (${records.length})` },
                    { key: "student", label: `Students (${stuCount})` },
                    { key: "faculty", label: `Faculty (${facCount})` },
                ].map(t => (
                    <button key={t.key} onClick={() => setFilter(t.key)}
                        className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
              transition-all whitespace-nowrap
              ${filter === t.key
                                ? "bg-violet-600 text-white"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Empty */}
            {filtered.length === 0 ? (
                <div className="card text-center py-14">
                    <p className="text-4xl mb-3">🎉</p>
                    <p className="text-slate-400 font-medium">No pending approvals</p>
                </div>
            ) : (
                /* Cards grid */
                <div className="grid gap-4"
                    style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
                    {filtered.map(r => (
                        <motion.div key={r._id} layout
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card space-y-3">

                            {/* User row */}
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700
                                flex items-center justify-center flex-shrink-0">
                                    {r.user?.profilePicture
                                        ? <img src={r.user.profilePicture} alt="" className="w-full h-full object-cover" />
                                        : <span className="text-xl">{r.userType === "faculty" ? "👩‍🏫" : "👨‍🎓"}</span>
                                    }
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-800 dark:text-white text-sm truncate">
                                        {r.user?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{r.user?.email}</p>
                                    <p className="text-xs text-slate-400">
                                        {r.userType === "student"
                                            ? `Roll: ${r.user?.rollNumber || "—"}`
                                            : `Emp: ${r.user?.employeeId || "—"}`}
                                    </p>
                                </div>
                                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full capitalize
                  ${r.userType === "faculty"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"}`}>
                                    {r.userType}
                                </span>
                            </div>

                            {/* Date + times */}
                            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3 space-y-2">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    📅 {fmtDate(r.date)}
                                </p>
                                <div className="flex gap-4 flex-wrap">
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide">Check-in</p>
                                        <p className={`font-bold text-sm ${r.checkIn?.time ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"}`}>
                                            {r.checkIn?.time ? fmt(r.checkIn.time) : "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wide">Check-out</p>
                                        <p className={`font-bold text-sm ${r.checkOut?.time ? "text-violet-500" : "text-slate-300 dark:text-slate-600"}`}>
                                            {r.checkOut?.time ? fmt(r.checkOut.time) : "—"}
                                        </p>
                                    </div>
                                    {r.workingHours && (
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase tracking-wide">Hours</p>
                                            <p className="font-bold text-sm text-amber-500">{r.workingHours}h</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                <motion.button whileTap={{ scale: 0.97 }}
                                    onClick={() => approve(r._id)}
                                    disabled={actioning === r._id}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600
                             text-white font-semibold text-sm transition-all disabled:opacity-60">
                                    {actioning === r._id ? "…" : "✅ Approve"}
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.97 }}
                                    onClick={() => setRejectId(r._id)}
                                    disabled={!!actioning}
                                    className="flex-1 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20
                             hover:bg-red-100 dark:hover:bg-red-900/40
                             text-red-600 dark:text-red-400 font-semibold text-sm
                             transition-all disabled:opacity-60">
                                    ❌ Reject
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}