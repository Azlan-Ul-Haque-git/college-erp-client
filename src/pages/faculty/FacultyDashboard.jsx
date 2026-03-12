import { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { ClipboardDocumentListIcon, ChartBarIcon, BellIcon, CalendarIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axiosInstance";
import AssignmentManager from "./AssignmentManager";
import LeaveApplication from "./LeaveApplication";
import NotesUpload from "./NotesUpload";
import FacultyAttendance from "./FacultyAttendance";
import socket from "../../utils/socket";

/* ---------------------- FACULTY NOTICES ---------------------- */

function FacultyNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notices")
      .then(r => setNotices(r.data.notices || []))
      .catch(() => { })
      .finally(() => setLoading(false));
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
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card"
          >
            <h3 className="font-semibold dark:text-white">{n.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{n.content}</p>
            <p className="text-xs text-slate-400 mt-2">
              By: {n.postedBy?.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function FacultyChat() {

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    api.get("/chat/users").then(r => setUsers(r.data.users || [])).catch(() => { });
  }, []);

  // realtime messages
  useEffect(() => {

    socket.on("chat:message", (msg) => {

      if (
        msg.sender?._id === selected?._id ||
        msg.receiver === selected?._id
      ) {
        setMessages(prev => [...prev, msg]);
      }

    });

    return () => socket.off("chat:message");

  }, [selected]);

  const openChat = async (u) => {

    setSelected(u);
    setMessages([]);

    const roomId = [user._id, u._id].sort().join("_");

    socket.emit("chat:join", roomId);

    try {
      const { data } = await api.get(`/chat/${u._id}`);
      setMessages(data.messages || []);
    } catch { }

  };

  const sendMsg = () => {

    if (!text.trim() || !selected) return;

    socket.emit("chat:message", {
      senderId: user._id,
      receiverId: selected._id,
      content: text
    });

    setText("");

  };

  return (
    <div className="space-y-4">

      <h1 className="text-2xl font-bold dark:text-white">
        💬 Chat
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">

        <div className="card overflow-y-auto">

          {users.map(u => (

            <div
              key={u._id}
              onClick={() => openChat(u)}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >

              <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {u.name?.[0]?.toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-medium dark:text-white">{u.name}</p>
                <p className="text-xs text-slate-400">{u.role}</p>
              </div>

            </div>

          ))}

        </div>

        <div className="lg:col-span-2 card flex flex-col">

          {selected ? (
            <>
              <div className="border-b pb-3 mb-3 dark:border-slate-700">
                <p className="font-semibold dark:text-white">{selected.name}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 mb-3">

                {messages.map((m, i) => (

                  <div
                    key={i}
                    className={`flex ${m.sender?._id === user._id
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >

                    <div
                      className={`px-3 py-2 rounded-xl text-sm ${m.sender?._id === user._id
                        ? "bg-purple-600 text-white"
                        : "bg-slate-200 dark:bg-slate-700 dark:text-white"
                        }`}
                    >
                      {m.content}
                    </div>

                  </div>

                ))}

              </div>

              <div className="flex gap-2">

                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()}
                  className="flex-1 border rounded-xl px-3 py-2 text-sm"
                  placeholder="Type message..."
                />

                <button
                  onClick={sendMsg}
                  className="bg-purple-600 text-white px-4 py-2 rounded-xl"
                >
                  Send
                </button>

              </div>
            </>
          ) : (
            <p className="text-center text-slate-400">
              Select a student to chat
            </p>
          )}

        </div>

      </div>

    </div>
  );
}
/* ---------------------- DASHBOARD ---------------------- */

function FacultyHome() {

  const { user } = useAuth();

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">
        Welcome {user?.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <StatCard title="Students" value="120" icon={ClipboardDocumentListIcon} />
        <StatCard title="Attendance" value="84%" icon={ChartBarIcon} />
        <StatCard title="Notices" value="5" icon={BellIcon} />
        <StatCard title="Classes Today" value="4" icon={CalendarIcon} />

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
        <Route path="notices" element={<FacultyNotices />} />
        <Route path="chat" element={<FacultyChat />} />

        <Route path="assignments" element={<AssignmentManager />} />
        <Route path="leaves" element={<LeaveApplication />} />
        <Route path="notes" element={<NotesUpload />} />

        <Route path="*" element={<FacultyHome />} />

      </Routes>

    </Layout>
  );

}
