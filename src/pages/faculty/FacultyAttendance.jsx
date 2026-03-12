import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";

const fmt = d => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN") : "—";

const STATUS_BTN = {
  present: { active: "bg-emerald-500 text-white", idle: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 hover:bg-emerald-50" },
  absent: { active: "bg-red-500 text-white", idle: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 hover:bg-red-50" },
  late: { active: "bg-amber-500 text-white", idle: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 hover:bg-amber-50" },
};
const APPROVAL = {
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
};

const TABS = [
  { key: "self", label: "👤 My Attendance" },
  { key: "mark", label: "📋 Mark Students" },
  { key: "add", label: "➕ Add Student" },
];

export default function FacultyAttendance() {
  const [tab, setTab] = useState("self");

  // Self attendance
  const [today, setToday] = useState(null);
  const [myRecords, setMyRecords] = useState([]);
  const [selfLoading, setSelfLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Mark students
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [stuLoading, setStuLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  // Add student form
  const blankStudent = { name: "", email: "", rollNumber: "", password: "", course: "", semester: "", section: "", branch: "", phone: "" };
  const [form, setForm] = useState(blankStudent);
  const [adding, setAdding] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  // ── Fetch self attendance ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([
          api.get("/attendance/my-status"),
          api.get("/attendance"),
        ]);
        setToday(s.data.data || null);
        setMyRecords(r.data.data || []);
      } catch {/* ignore */ }
      finally { setSelfLoading(false); }
    })();
  }, []);

  // ── Self check-in / check-out ─────────────────────────────────────────────
  const checkIn = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/attendance/checkin");
      setToday(data.data);
      showToast("✅ Checked in! Pending admin approval.");
    } catch (e) { showToast(e.response?.data?.message || "Check-in failed", false); }
    finally { setActionLoading(false); }
  };
  const checkOut = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.post("/attendance/checkout");
      setToday(data.data);
      showToast("✅ Checked out!");
    } catch (e) { showToast(e.response?.data?.message || "Check-out failed", false); }
    finally { setActionLoading(false); }
  };

  // ── Load students for marking ─────────────────────────────────────────────
  const loadStudents = async () => {
    if (!course) return showToast("Enter a course first", false);
    setStuLoading(true);
    try {
      const { data } = await api.get(`/students?course=${course}`);
      const list = data.data || [];
      setStudents(list);
      const init = {};
      list.forEach(s => { init[s._id] = "present"; });
      setStatuses(init);
      if (!list.length) showToast("No students found for this course", false);
    } catch { showToast("Failed to load students", false); }
    finally { setStuLoading(false); }
  };

  // ── Mark attendance ───────────────────────────────────────────────────────
  const markAttendance = async () => {
    if (!course || !subject || !date) return showToast("Fill course, subject & date", false);
    setMarking(true);
    try {
      await Promise.all(
        students.map(s =>
          api.post("/attendance/mark", {
            studentId: s._id,
            date, status: statuses[s._id] || "present",
            course, subject, semester: s.semester, section: s.section,
          })
        )
      );
      showToast(`✅ Attendance saved for ${students.length} students.`);
    } catch { showToast("Failed to save attendance", false); }
    finally { setMarking(false); }
  };

  // ── Add student ───────────────────────────────────────────────────────────
  const addStudent = async e => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post("/students/add", { ...form, role: "student" });
      showToast(`✅ Student "${form.name}" added!`);
      setForm(blankStudent);
    } catch (e) { showToast(e.response?.data?.message || "Failed to add student", false); }
    finally { setAdding(false); }
  };

  const checkedIn = !!today?.checkIn?.time;
  const checkedOut = !!today?.checkOut?.time;
  const approval = today?.approvalStatus;

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto px-2 sm:px-0">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
              ${toast.ok ? "bg-emerald-500" : "bg-red-500"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
        📅 Faculty Attendance
      </h1>

      {/* Tab bar — scrollable on xs so it never wraps ugly */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold
              transition-all whitespace-nowrap
              ${tab === t.key
                ? "bg-violet-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: My Attendance ══════════════════════════════════════════════ */}
      {tab === "self" && (
        <div className="space-y-4">
          {selfLoading ? (
            <div className="card text-center text-slate-400 py-8">Loading…</div>
          ) : (
            <>
              {/* Check-in card */}
              <div className="card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 text-sm sm:text-base">
                    Today — {fmtDate(new Date())}
                  </p>
                  {approval && approval !== "not_required" && (
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${APPROVAL[approval] || ""}`}>
                      {approval === "pending" && "⏳ Pending"}
                      {approval === "approved" && "✅ Approved"}
                      {approval === "rejected" && "❌ Rejected"}
                    </span>
                  )}
                </div>

                {/* Times */}
                <div className="flex flex-wrap gap-4 sm:gap-8 items-center">
                  <TimeBlock label="Check-in" value={checkedIn ? fmt(today.checkIn.time) : "—"} active={checkedIn} color="text-emerald-500" />
                  <span className="text-slate-300 dark:text-slate-600 hidden sm:block text-xl">→</span>
                  <TimeBlock label="Check-out" value={checkedOut ? fmt(today.checkOut.time) : "—"} active={checkedOut} color="text-violet-500" />
                  {today?.workingHours && (
                    <TimeBlock label="Hours" value={`${today.workingHours}h`} active color="text-amber-500" />
                  )}
                </div>

                {/* Buttons */}
                <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
                  <motion.button whileTap={{ scale: 0.97 }}
                    disabled={checkedIn || actionLoading} onClick={checkIn}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60
                      ${checkedIn
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
                  >
                    {actionLoading && !checkedIn ? "…" : checkedIn ? "✅ Checked In" : "🟢 Check In"}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }}
                    disabled={!checkedIn || checkedOut || actionLoading} onClick={checkOut}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60
                      ${checkedOut
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 cursor-default"
                        : !checkedIn
                          ? "bg-slate-100 text-slate-400 dark:bg-slate-700 cursor-not-allowed"
                          : "bg-violet-500 hover:bg-violet-600 text-white"}`}
                  >
                    {actionLoading && checkedIn && !checkedOut ? "…" : checkedOut ? "✅ Checked Out" : "🔴 Check Out"}
                  </motion.button>
                </div>
              </div>

              {/* History */}
              <div className="card overflow-hidden p-0">
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 p-4
                                border-b border-slate-100 dark:border-slate-700">
                  My Attendance History
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm min-w-[500px]">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        {["Date", "Status", "Check-in", "Check-out", "Hours", "Approval"].map(h => (
                          <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold
                                                  text-slate-400 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {myRecords.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">No records yet</td></tr>
                      ) : myRecords.map((r, i) => (
                        <tr key={r._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-3 sm:px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(r.date)}</td>
                          <td className="px-3 sm:px-4 py-2.5">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{r.checkIn?.time ? fmt(r.checkIn.time) : "—"}</td>
                          <td className="px-3 sm:px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{r.checkOut?.time ? fmt(r.checkOut.time) : "—"}</td>
                          <td className="px-3 sm:px-4 py-2.5 text-slate-500 dark:text-slate-400">{r.workingHours ? `${r.workingHours}h` : "—"}</td>
                          <td className="px-3 sm:px-4 py-2.5">
                            {r.approvalStatus && r.approvalStatus !== "not_required"
                              ? <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${APPROVAL[r.approvalStatus] || ""}`}>{r.approvalStatus}</span>
                              : <span className="text-slate-300 dark:text-slate-600">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ TAB: Mark Students ══════════════════════════════════════════════ */}
      {tab === "mark" && (
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              Mark Student Attendance
            </h2>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Date">
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="input-field" />
              </Field>
              <Field label="Course *">
                <input type="text" placeholder="e.g. BCA, MCA, B.Tech" value={course}
                  onChange={e => setCourse(e.target.value)} className="input-field" />
              </Field>
              <Field label="Subject *">
                <input type="text" placeholder="e.g. Data Structures" value={subject}
                  onChange={e => setSubject(e.target.value)} className="input-field" />
              </Field>
              <div className="flex items-end">
                <motion.button whileTap={{ scale: 0.97 }} onClick={loadStudents}
                  disabled={stuLoading}
                  className="btn-primary w-full py-2.5 disabled:opacity-60">
                  {stuLoading ? "Loading…" : "Load Students"}
                </motion.button>
              </div>
            </div>

            {/* Bulk toggles */}
            {students.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">{students.length} students</span>
                {["present", "absent", "late"].map(st => (
                  <button key={st} onClick={() => {
                    const all = {};
                    students.forEach(s => { all[s._id] = st; });
                    setStatuses(all);
                  }} className={`text-xs px-3 py-1 rounded-full font-semibold transition-all
                    ${st === "present" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                      st === "absent" ? "bg-red-100 text-red-600 hover:bg-red-200" :
                        "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                  >
                    All {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Student table */}
          {students.length > 0 && (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm min-w-[360px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      {["#", "Name", "Roll No", "Status"].map(h => (
                        <th key={h} className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold
                                                text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {students.map((s, i) => (
                      <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 sm:px-4 py-2.5 text-slate-400">{i + 1}</td>
                        <td className="px-3 sm:px-4 py-2.5">
                          <p className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{s.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[140px]">{s.email}</p>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.rollNumber}</td>
                        <td className="px-3 sm:px-4 py-2.5">
                          <div className="flex gap-1.5">
                            {["present", "absent", "late"].map(st => (
                              <button key={st}
                                onClick={() => setStatuses(p => ({ ...p, [s._id]: st }))}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all
                                  ${statuses[s._id] === st
                                    ? STATUS_BTN[st].active
                                    : STATUS_BTN[st].idle}`}
                                title={st.charAt(0).toUpperCase() + st.slice(1)}
                              >
                                {st === "present" ? "P" : st === "absent" ? "A" : "L"}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                <motion.button whileTap={{ scale: 0.97 }} onClick={markAttendance}
                  disabled={marking}
                  className="btn-primary w-full py-3 disabled:opacity-60">
                  {marking ? "Saving…" : "💾 Save Attendance"}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ TAB: Add Student ════════════════════════════════════════════════ */}
      {tab === "add" && (
        <div className="card space-y-4">
          <h2 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            Add New Student
          </h2>
          <p className="text-xs text-slate-400">
            Students you add can log in using their email and the password you set.
          </p>

          <form onSubmit={addStudent}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { key: "name", label: "Full Name *", type: "text", req: true },
              { key: "email", label: "Email *", type: "email", req: true },
              { key: "rollNumber", label: "Roll Number *", type: "text", req: true },
              { key: "password", label: "Password *", type: "password", req: true },
              { key: "course", label: "Course *", type: "text", req: true },
              { key: "semester", label: "Semester", type: "text" },
              { key: "section", label: "Section", type: "text" },
              { key: "branch", label: "Branch", type: "text" },
              { key: "phone", label: "Phone", type: "tel" },
            ].map(({ key, label, type, req }) => (
              <Field key={key} label={label}>
                <input
                  type={type}
                  required={req}
                  placeholder={`Enter ${label.replace(" *", "").toLowerCase()}`}
                  value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="input-field"
                />
              </Field>
            ))}

            <div className="sm:col-span-2 pt-1">
              <motion.button whileTap={{ scale: 0.97 }} type="submit"
                disabled={adding}
                className="btn-primary w-full py-3 disabled:opacity-60">
                {adding ? "Adding student…" : "➕ Add Student"}
              </motion.button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function TimeBlock({ label, value, active, color }) {
  return (
    <div className="flex flex-col items-center min-w-[56px]">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{label}</p>
      <p className={`font-bold mt-0.5 text-lg sm:text-xl
        ${active ? color : "text-slate-300 dark:text-slate-600"}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = {
    present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    absent: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400",
    late: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    pending: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize
      ${cls[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</label>
      {children}
    </div>
  );
}