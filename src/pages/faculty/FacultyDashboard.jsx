import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { ClipboardDocumentListIcon, ChartBarIcon, BellIcon, CalendarIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axiosInstance";
import MarkAttendance from "./MarkAttendance";
import UploadMarks from "./UploadMarks";
import AssignmentManager from "./AssignmentManager";
import LeaveApplication from "./LeaveApplication";
import NotesUpload from "./NotesUpload";
import FacultyAttendance from "./FacultyAttendance";
import { useState, useEffect, useRef } from "react";
// Faculty Notices Page
function FacultyNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notices").then(r => setNotices(r.data.notices || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notices</h1>
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-slate-400 py-8">Loading...</p>
        ) : notices.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Koi notice nahi hai abhi</p>
        ) : notices.map((n, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold dark:text-white">{n.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{n.content}</p>
                <p className="text-xs text-slate-400 mt-2">By: {n.postedBy?.name} · {new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 ${n.targetRole === "all" ? "bg-purple-100 text-purple-700" :
                n.targetRole === "faculty" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                }`}>{n.targetRole}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
function FacultyTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Faculty ki apni department/branch ke hisaab se timetable
    api.get("/timetable").then(r => setTimetable(r.data.timetable || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayColors = {
    Monday: "from-purple-500 to-purple-600", Tuesday: "from-blue-500 to-blue-600",
    Wednesday: "from-emerald-500 to-emerald-600", Thursday: "from-orange-500 to-orange-600",
    Friday: "from-pink-500 to-pink-600", Saturday: "from-teal-500 to-teal-600",
  };

  if (loading) return <div className="card text-center py-12"><p className="text-slate-400">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Timetable</h1>
      {timetable.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400">No timetable uploaded by admin yet</p>
        </div>
      ) : DAYS.map(day => {
        const entries = timetable.filter(t => t.day === day);
        if (!entries.length) return null;
        return (
          <motion.div key={day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
            <div className={`inline-flex px-3 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r ${dayColors[day]} mb-4`}>
              {day}
            </div>
            <div className="space-y-2">
              {entries.flatMap(e => e.slots.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="text-xs font-bold text-purple-600 w-28 flex-shrink-0">{s.startTime} - {s.endTime}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm dark:text-white">{s.subject}</p>
                    <p className="text-xs text-slate-400">Room: {s.room}</p>
                  </div>
                </div>
              )))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
function FacultyChat() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState([]);
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState({});
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get("/chat/users").then(r => {
      const users = r.data.users || [];
      setUsers(users);
      // Fetch unread counts for each user
      users.forEach(async u => {
        try {
          const { data } = await api.get(`/chat/${u._id}`);
          const unreadCount = (data.messages || []).filter(
            m => m.sender?._id !== user?._id && !m.isRead
          ).length;
          if (unreadCount > 0) setUnread(p => ({ ...p, [u._id]: unreadCount }));
        } catch { }
      });
    }).catch(() => { });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openChat = async (u) => {
    setSelected(u);
    setMessages([]);
    setUnread(p => ({ ...p, [u._id]: 0 }));
    const { data } = await api.get(`/chat/${u._id}`);
    setMessages(data.messages || []);
  };

  const sendMsg = async () => {
    if (!text.trim() || !selected || sending) return;
    setSending(true);
    try {
      await api.post(`/chat/${selected._id}`, { content: text });
      setText("");
      const { data } = await api.get(`/chat/${selected._id}`);
      setMessages(data.messages || []);
    } catch { } finally { setSending(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">💬 Chat</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "600px" }}>

        {/* Users list */}
        <div className="card overflow-y-auto">
          <h3 className="font-semibold dark:text-white mb-3 text-xs text-slate-500 uppercase tracking-wide">Students</h3>
          {users.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No students</p>
          ) : users.map(u => (
            <div key={u._id} onClick={() => openChat(u)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 transition relative ${selected?._id === u._id
                ? "bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700"
                : "hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}>
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium dark:text-white truncate">{u.name}</p>
                <p className="text-xs text-slate-400 capitalize">{u.role}</p>
              </div>
              {unread[u._id] > 0 && (
                <span className="w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {unread[u._id]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Chat window */}
        <div className="lg:col-span-2 card flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b dark:border-slate-700 pb-3 mb-3 flex-shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold dark:text-white">{selected.name}</p>
                  <p className="text-xs text-green-500">● Online</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
                {messages.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No messages yet! Say hi 👋</p>
                ) : messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender?._id === user?._id ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm max-w-xs break-words ${m.sender?._id === user?._id
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-slate-100 dark:bg-slate-700 dark:text-white rounded-bl-sm"
                      }`}>
                      {m.content}
                      {m.sender?._id === user?._id && (
                        <span className="text-xs ml-2 opacity-70">
                          {m.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <input value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()}
                  placeholder="Type message..."
                  className="flex-1 border dark:border-slate-600 rounded-xl px-3 py-2 text-sm dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-400" />
                <button onClick={sendMsg} disabled={sending || !text.trim()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-slate-400">Select a student to chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function FacultyHome() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get("/notices").then(r => setNotices((r.data.notices || []).slice(0, 3))).catch(() => { });
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Manage attendance, marks and more.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="My Students" value="120" icon={ClipboardDocumentListIcon} color="from-blue-500 to-cyan-600" delay={0} />
        <StatCard title="Classes Today" value="4" icon={CalendarIcon} color="from-violet-500 to-purple-600" delay={0.1} />
        <StatCard title="Avg Attendance" value="84%" icon={ChartBarIcon} color="from-emerald-500 to-teal-600" delay={0.2} />
        <StatCard title="Notices" value={notices.length.toString()} icon={BellIcon} color="from-orange-500 to-amber-600" delay={0.3} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {[
              { time: "9:00 AM", subj: "Data Structures", room: "CS-101", branch: "CSE-2A" },
              { time: "11:00 AM", subj: "DBMS", room: "CS-102", branch: "IT-3B" },
              { time: "2:00 PM", subj: "Operating Systems", room: "CS-201", branch: "CSE-3A" },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 w-16 flex-shrink-0">{c.time}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{c.subj}</p>
                  <p className="text-xs text-slate-400">{c.branch} · Room {c.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Latest Notices</h3>
          {notices.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Koi notice nahi hai</p>
          ) : notices.map((n, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-2">
              <div className="w-2 h-2 rounded-full mt-1.5 bg-purple-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium dark:text-white">{n.title}</p>
                <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard" element={<FacultyHome />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="marks" element={<UploadMarks />} />
        <Route path="timetable" element={<FacultyTimetable />} />
        <Route path="notices" element={<FacultyNotices />} />
        <Route path="chat" element={<FacultyChat />} />
        <Route path="*" element={<FacultyHome />} />
        <Route path="assignments" element={<AssignmentManager />} />
        <Route path="leaves" element={<LeaveApplication />} />
        <Route path="notes" element={<NotesUpload />} />
      </Routes>
    </Layout>
  );
}