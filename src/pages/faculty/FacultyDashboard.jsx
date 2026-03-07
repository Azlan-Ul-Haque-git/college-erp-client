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

// Faculty Timetable Page
function FacultyTimetable() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const schedule = [
    { day: "Monday", time: "9:00 AM", subject: "Data Structures", branch: "CSE-2A", room: "CS-101" },
    { day: "Monday", time: "11:00 AM", subject: "DBMS", branch: "IT-3B", room: "CS-102" },
    { day: "Tuesday", time: "10:00 AM", subject: "Operating Systems", branch: "CSE-3A", room: "CS-201" },
    { day: "Wednesday", time: "9:00 AM", subject: "Data Structures", branch: "CSE-2A", room: "CS-101" },
    { day: "Thursday", time: "11:00 AM", subject: "DBMS", branch: "IT-3B", room: "CS-102" },
    { day: "Friday", time: "2:00 PM", subject: "Operating Systems", branch: "CSE-3A", room: "CS-201" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Timetable</h1>
      {days.map(day => {
        const classes = schedule.filter(s => s.day === day);
        if (classes.length === 0) return null;
        return (
          <div key={day} className="card">
            <h3 className="font-semibold dark:text-white mb-3 text-purple-600">{day}</h3>
            <div className="space-y-2">
              {classes.map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="text-xs font-bold text-purple-600 w-20 flex-shrink-0">{c.time}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm dark:text-white">{c.subject}</p>
                    <p className="text-xs text-slate-400">{c.branch} · Room {c.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Faculty Chat Page
function FacultyChat() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    api.get("/chat/users").then(r => setUsers(r.data.users || [])).catch(() => { });
  }, []);

  const openChat = async (u) => {
    setSelected(u);
    const { data } = await api.get(`/chat/${u._id}`);
    setMessages(data.messages || []);
  };

  const sendMsg = async () => {
    if (!text.trim() || !selected) return;
    await api.post(`/chat/${selected._id}`, { content: text });
    setText("");
    const { data } = await api.get(`/chat/${selected._id}`);
    setMessages(data.messages || []);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Chat</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
        <div className="card overflow-y-auto">
          <h3 className="font-semibold dark:text-white mb-3">Students</h3>
          {users.map(u => (
            <div key={u._id} onClick={() => openChat(u)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-1 ${selected?._id === u._id ? "bg-purple-50 dark:bg-purple-900/30" : "hover:bg-slate-50 dark:hover:bg-slate-700"}`}>
              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-700 text-sm">
                {u.name?.[0]}
              </div>
              <p className="text-sm font-medium dark:text-white">{u.name}</p>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 card flex flex-col">
          {selected ? (
            <>
              <div className="border-b dark:border-slate-700 pb-3 mb-3">
                <p className="font-semibold dark:text-white">{selected.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender?._id === user?._id ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-xl text-sm max-w-xs ${m.sender?._id === user?._id ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 dark:text-white"}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()}
                  placeholder="Type Message..." className="flex-1 border rounded-xl px-3 py-2 text-sm dark:bg-slate-700 dark:text-white dark:border-slate-600" />
                <button onClick={sendMsg} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold">Send</button>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-center my-auto">Select Student to Talk</p>
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
        <Route path="attendance" element={<MarkAttendance />} />
        <Route path="marks" element={<UploadMarks />} />
        <Route path="timetable" element={<FacultyTimetable />} />
        <Route path="notices" element={<FacultyNotices />} />
        <Route path="chat" element={<FacultyChat />} />
        <Route path="*" element={<FacultyHome />} />
      </Routes>
    </Layout>
  );
}