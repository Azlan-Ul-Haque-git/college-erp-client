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

/* ---------------------- FACULTY CHAT ---------------------- */

function FacultyChat() {

  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [unread, setUnread] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  const messagesEndRef = useRef(null);

  /* JOIN SOCKET */

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id);
    }
  }, [user]);

  /* LOAD CHAT USERS */

  useEffect(() => {
    api.get("/chat/users")
      .then(r => setUsers(r.data.users || []))
      .catch(() => { });
  }, []);

  /* RECEIVE REALTIME MESSAGE */

  useEffect(() => {

    socket.on("receiveMessage", (msg) => {

      if (msg.sender === selected?._id) {
        setMessages(prev => [...prev, msg]);
      }
      else {
        setUnread(prev => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1
        }));
      }

    });

    socket.on("onlineUsers", (list) => {
      setOnlineUsers(list);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("onlineUsers");
    };

  }, [selected]);

  /* AUTO SCROLL */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* OPEN CHAT */

  const openChat = async (u) => {

    setSelected(u);
    setUnread(p => ({ ...p, [u._id]: 0 }));

    try {
      const { data } = await api.get(`/ chat / ${u._id} `);
      setMessages(data.messages || []);
    } catch { }

  };

  /* SEND MESSAGE */

  const sendMsg = () => {

    if (!text.trim() || !selected) return;

    const msg = {
      sender: user._id,
      receiver: selected._id,
      content: text,
      createdAt: new Date()
    };

    socket.emit("sendMessage", msg);

    setMessages(prev => [...prev, msg]);
    setText("");

  };

  return (

    <div className="space-y-4">

      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">💬 Chat</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ height: "600px" }}>

        {/* USER LIST */}

        <div className="card overflow-y-auto">

          {users.map(u => (

            <div
              key={u._id}
              onClick={() => openChat(u)}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50"
            >

              <div className="w-9 h-9 bg-purple-600 rounded-full text-white flex items-center justify-center">
                {u.name?.[0]}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{u.name}</p>
              </div>

              {unread[u._id] > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 rounded-full">
                  {unread[u._id]}
                </span>
              )}

            </div>

          ))}

        </div>

        {/* CHAT WINDOW */}

        <div className="md:col-span-2 card flex flex-col">

          {selected ? (

            <>
              <div className="border-b pb-2 mb-2">

                <p className="font-semibold">{selected.name}</p>

                <p className={`text - xs ${onlineUsers.includes(selected._id)
                  ? "text-green-500"
                  : "text-gray-400"
                  } `}>
                  ● {onlineUsers.includes(selected._id) ? "Online" : "Offline"}
                </p>

              </div>

              <div className="flex-1 overflow-y-auto space-y-2">

                {messages.map((m, i) => {

                  const isMe =
                    m.sender === user._id ||
                    m.sender?._id === user._id;

                  return (

                    <div
                      key={i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} `}
                    >

                      <div className={`px - 3 py - 2 rounded - xl text - sm ${isMe
                        ? "bg-purple-600 text-white"
                        : "bg-slate-200"
                        } `}>

                        {m.content}

                        {isMe && (
                          <span className="ml-2 text-xs">
                            {m.isRead ? "✓✓" : "✓"}
                          </span>
                        )}

                      </div>

                    </div>

                  );

                })}

                <div ref={messagesEndRef} />

              </div>

              <div className="flex gap-2 mt-2">

                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMsg()}
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Type message..."
                />

                <button
                  onClick={sendMsg}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>

              </div>

            </>

          ) : (

            <div className="flex items-center justify-center h-full text-gray-400">
              Select a student to chat
            </div>

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
