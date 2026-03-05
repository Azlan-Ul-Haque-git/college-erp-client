import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { ClipboardDocumentListIcon, ChartBarIcon, BanknotesIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axiosInstance";
import ViewAttendance from "./ViewAttendance";
import ViewMarks from "./ViewMarks";
import ViewFees from "./ViewFees";
import AIPrediction from "./AIPrediction";

// ─── Student Timetable ───────────────────────────────────────────────────────
function StudentTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const schedule = [
    { day: "Monday", time: "9:00 AM", subject: "Data Structures", faculty: "Prof. Sharma", room: "CS-101" },
    { day: "Monday", time: "11:00 AM", subject: "DBMS", faculty: "Prof. Gupta", room: "CS-102" },
    { day: "Monday", time: "2:00 PM", subject: "Computer Networks", faculty: "Prof. Verma", room: "CS-201" },
    { day: "Tuesday", time: "10:00 AM", subject: "Operating Systems", faculty: "Prof. Singh", room: "CS-103" },
    { day: "Tuesday", time: "12:00 PM", subject: "Software Engg", faculty: "Prof. Mishra", room: "CS-104" },
    { day: "Wednesday", time: "9:00 AM", subject: "Data Structures", faculty: "Prof. Sharma", room: "CS-101" },
    { day: "Wednesday", time: "11:00 AM", subject: "DBMS", faculty: "Prof. Gupta", room: "CS-102" },
    { day: "Thursday", time: "10:00 AM", subject: "Computer Networks", faculty: "Prof. Verma", room: "CS-201" },
    { day: "Thursday", time: "2:00 PM", subject: "Mathematics", faculty: "Prof. Joshi", room: "MA-101" },
    { day: "Friday", time: "9:00 AM", subject: "Operating Systems", faculty: "Prof. Singh", room: "CS-103" },
    { day: "Friday", time: "11:00 AM", subject: "Software Engg", faculty: "Prof. Mishra", room: "CS-104" },
    { day: "Saturday", time: "10:00 AM", subject: "Mathematics", faculty: "Prof. Joshi", room: "MA-101" },
  ];

  const dayColors = {
    Monday: "from-purple-500 to-purple-600", Tuesday: "from-blue-500 to-blue-600",
    Wednesday: "from-emerald-500 to-emerald-600", Thursday: "from-orange-500 to-orange-600",
    Friday: "from-pink-500 to-pink-600", Saturday: "from-teal-500 to-teal-600",
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Timetable</h1>
        <p className="text-slate-500 text-sm mt-1">Weekly class schedule</p>
      </motion.div>

      {days.map((day, di) => {
        const classes = schedule.filter(s => s.day === day);
        if (classes.length === 0) return null;
        return (
          <motion.div key={day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.05 }} className="card">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r ${dayColors[day]} mb-4`}>
              {day}
            </div>
            <div className="space-y-2">
              {classes.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="text-xs font-bold text-purple-600 dark:text-purple-400 w-20 flex-shrink-0">{c.time}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{c.subject}</p>
                    <p className="text-xs text-slate-400">{c.faculty} · Room {c.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Student Notices ─────────────────────────────────────────────────────────
function StudentNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notices")
      .then(r => setNotices(r.data.notices || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const catColor = (role) => {
    if (role === "all") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    if (role === "student") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    return "bg-gray-100 text-gray-700";
  };

  const dotColor = (role) => {
    if (role === "all") return "bg-purple-500";
    if (role === "student") return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notices</h1>
        <p className="text-slate-500 text-sm mt-1">Latest announcements from college</p>
      </motion.div>

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-slate-400">Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📢</p>
          <p className="text-slate-500">Koi notice nahi hai abhi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor(n.targetRole)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-white">{n.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${catColor(n.targetRole)}`}>
                      {n.targetRole}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{n.content}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Posted by {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Student Chat ─────────────────────────────────────────────────────────────
function StudentChat() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/chat/users").then(r => setUsers(r.data.users || [])).catch(() => { });
  }, []);

  const openChat = async (u) => {
    setSelected(u);
    setMessages([]);
    const { data } = await api.get(`/chat/${u._id}`);
    setMessages(data.messages || []);
  };

  const sendMsg = async () => {
    if (!text.trim() || !selected || sending) return;
    setSending(true);
    await api.post(`/chat/${selected._id}`, { content: text });
    setText("");
    const { data } = await api.get(`/chat/${selected._id}`);
    setMessages(data.messages || []);
    setSending(false);
  };

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Chat</h1>
        <p className="text-slate-500 text-sm mt-1">Faculty se seedha baat karo</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "600px" }}>
        {/* Users list */}
        <div className="card overflow-y-auto">
          <h3 className="font-semibold dark:text-white mb-3 text-sm text-slate-500 uppercase tracking-wide">Faculty</h3>
          {users.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Koi faculty nahi mili</p>
          ) : users.map(u => (
            <div key={u._id} onClick={() => openChat(u)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 transition ${selected?._id === u._id
                  ? "bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-slate-400 capitalize">{u.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2 card flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b dark:border-slate-700 pb-3 mb-3 flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold dark:text-white">{selected.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{selected.role}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
                {messages.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Koi message nahi hai abhi — hi karo! 👋</p>
                ) : messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender?._id === user?._id ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm max-w-xs break-words ${m.sender?._id === user?._id
                        ? "bg-purple-600 text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-slate-700 dark:text-white rounded-bl-sm"
                      }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()}
                  placeholder="Message likho..."
                  className="flex-1 border dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={sendMsg}
                  disabled={sending || !text.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-slate-400">Faculty select karo baat karne ke liye</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Student Home ─────────────────────────────────────────────────────────────
function StudentHome() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api.get("/attendance/my").then(r => setAttendance(r.data.data || [])).catch(() => { });
    api.get("/marks/my-marks").then(r => setMarks(r.data.marks || [])).catch(() => { });
    api.get("/fees/my-fees").then(r => setFees(r.data.fees || null)).catch(() => { });
    api.get("/notices").then(r => setNotices((r.data.notices || []).slice(0, 3))).catch(() => { });
  }, []);

  const presentCount = attendance.filter(a => a.status === "present").length;
  const attendancePct = attendance.length > 0 ? Math.round(presentCount / attendance.length * 100) : 0;
  const cgpa = marks.length > 0
    ? (marks.reduce((a, m) => a + (m.total || 0) / 10, 0) / marks.length).toFixed(1)
    : "N/A";

  const radarData = marks.length > 0
    ? marks.slice(0, 6).map(m => ({ subject: m.subject?.substring(0, 6) || "Sub", score: m.total || 0 }))
    : [
      { subject: "Math", score: 85 }, { subject: "DBMS", score: 72 },
      { subject: "OS", score: 90 }, { subject: "DSA", score: 68 },
      { subject: "CN", score: 78 }, { subject: "SE", score: 82 },
    ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Welcome, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's your academic overview.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={attendance.length > 0 ? `${attendancePct}%` : "N/A"} subtitle="Target: 75%" icon={ClipboardDocumentListIcon} color="from-violet-500 to-purple-600" delay={0} />
        <StatCard title="CGPA" value={cgpa} subtitle="Current sem" icon={AcademicCapIcon} color="from-blue-500 to-cyan-600" delay={0.1} />
        <StatCard title="Fee Status" value={fees?.status || "N/A"} subtitle="This semester" icon={BanknotesIcon} color="from-emerald-500 to-teal-600" delay={0.2} />
        <StatCard title="Subjects" value={marks.length > 0 ? marks.length : "N/A"} subtitle="This semester" icon={ChartBarIcon} color="from-orange-500 to-amber-600" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Notices</h3>
          {notices.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Koi notice nahi hai</p>
          ) : notices.map((n, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-2">
              <div className="w-2 h-2 rounded-full mt-1.5 bg-purple-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{n.title}</p>
                <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Attendance summary */}
      {attendance.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Attendance Summary</h3>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{attendancePct}%</p>
              <p className="text-xs text-slate-400 mt-1">Overall</p>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-4">
              <div className="h-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                style={{ width: `${Math.min(attendancePct, 100)}%` }} />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold dark:text-white">{presentCount}/{attendance.length}</p>
              <p className="text-xs text-slate-400">Classes</p>
            </div>
          </div>
          {attendancePct < 75 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              ⚠️ Attendance 75% se kam hai! Aur classes attend karo.
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard" element={<StudentHome />} />
        <Route path="attendance" element={<ViewAttendance />} />
        <Route path="marks" element={<ViewMarks />} />
        <Route path="fees" element={<ViewFees />} />
        <Route path="timetable" element={<StudentTimetable />} />
        <Route path="notices" element={<StudentNotices />} />
        <Route path="chat" element={<StudentChat />} />
        <Route path="ai" element={<AIPrediction />} />
        <Route path="*" element={<StudentHome />} />
      </Routes>
    </Layout>
  );
}