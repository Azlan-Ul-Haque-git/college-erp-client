import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

const SUBJECTS = ["Mathematics","Physics","Chemistry","Computer Science","English","Data Structures","DBMS","Operating System","Computer Networks","Software Engineering"];

export default function FacultyAttendance() {
  const [tab, setTab] = useState("checkin");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [myHistory, setMyHistory] = useState([]);

  // For student verification
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [pending, setPending] = useState([]);
  const [fetchingPending, setFetchingPending] = useState(false);

  useEffect(() => {
    getLocation();
    fetchMyHistory();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) { setLocationError("GPS not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setLocationError("Location access denied! Please allow location."),
      { enableHighAccuracy: true }
    );
  };

  const fetchMyHistory = async () => {
    try {
      const { data } = await api.get("/attendance/faculty-my");
      setMyHistory(data.data || []);
      // Check if today already marked
      const today = new Date().toISOString().split("T")[0];
      if (data.data?.some(r => r.date === today)) setChecked(true);
    } catch { }
  };

  const handleCheckin = async () => {
    if (!location) { toast.error("Location not found! Allow GPS first."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/attendance/faculty-checkin", {
        latitude: location.latitude,
        longitude: location.longitude,
      });
      toast.success(data.message);
      setChecked(true);
      fetchMyHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkin failed");
    } finally { setLoading(false); }
  };

  const fetchPending = async () => {
    setFetchingPending(true);
    try {
      const { data } = await api.get(`/attendance/pending?subject=${subject}&date=${date}`);
      setPending(data.data || []);
      if (data.data?.length === 0) toast("No pending requests for this subject/date", { icon: "ℹ️" });
    } catch { toast.error("Failed to fetch"); }
    finally { setFetchingPending(false); }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.put(`/attendance/verify/${id}`, { status });
      toast.success(`Marked as ${status}!`);
      setPending(p => p.filter(r => r._id !== id));
    } catch { toast.error("Verification failed"); }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📋 Attendance</h1>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-700/50 p-1 rounded-2xl">
        {[
          { key: "checkin", label: "🏫 My Checkin" },
          { key: "verify",  label: "✅ Verify Students" },
          { key: "history", label: "📅 My History" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              tab === t.key
                ? "bg-white dark:bg-slate-800 text-purple-600 shadow-sm"
                : "text-slate-500 dark:text-slate-400"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* MY CHECKIN TAB */}
      {tab === "checkin" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

          {/* Location Status */}
          <div className={`flex items-center gap-3 p-4 rounded-2xl ${
            location ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
          }`}>
            <span className="text-2xl">{location ? "📍" : "❌"}</span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${location ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {location
                  ? `Location found: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : locationError || "Getting location..."}
              </p>
            </div>
            {!location && (
              <button onClick={getLocation}
                className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-xl">
                Retry
              </button>
            )}
          </div>

          {/* Checkin Card */}
          <div className="card text-center py-8">
            {checked ? (
              <div>
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Attendance Marked!</h3>
                <p className="text-slate-400 text-sm">Today's attendance already marked.</p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">🏫</div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Mark Today's Attendance</h3>
                <p className="text-slate-400 text-sm mb-6">You must be within college premises</p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckin}
                  disabled={loading || !location}
                  className="btn-primary px-8 py-3 text-base disabled:opacity-50">
                  {loading ? "Checking in..." : "📍 Mark Attendance"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Today's stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="card text-center">
              <p className="text-2xl font-bold text-purple-600">{myHistory.length}</p>
              <p className="text-slate-400 text-sm">Total Days</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-green-600">
                {myHistory.filter(r => r.status === "present").length}
              </p>
              <p className="text-slate-400 text-sm">Present Days</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* VERIFY STUDENTS TAB */}
      {tab === "verify" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="card">
            <h3 className="font-semibold dark:text-white mb-4">Fetch Pending Requests</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Subject</label>
                <select value={subject} onChange={e => setSubject(e.target.value)} className="input">
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={fetchPending}
              disabled={fetchingPending} className="btn-primary w-full">
              {fetchingPending ? "Loading..." : "🔍 Fetch Pending Requests"}
            </motion.button>
          </div>

          <AnimatePresence>
            {pending.map((r, i) => (
              <motion.div key={r._id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: i * 0.05 }}
                className="card">
                <div className="flex items-center gap-4">
                  {/* Selfie */}
                  <div className="flex-shrink-0">
                    {r.selfie ? (
                      <img src={r.selfie} alt="selfie"
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-200" />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold dark:text-white">
                      {r.student?.user?.name || "Unknown Student"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {r.student?.user?.email}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      📍 {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)} · ⏰ {r.checkinTime ? new Date(r.checkinTime).toLocaleTimeString() : "N/A"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => handleVerify(r._id, "present")}
                      className="p-2.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-xl transition">
                      <CheckIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => handleVerify(r._id, "absent")}
                      className="p-2.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-xl transition">
                      <XMarkIcon className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {pending.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-slate-400 text-sm">Select subject & date then fetch pending requests</p>
            </div>
          )}
        </motion.div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {myHistory.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-slate-400">No attendance history yet</p>
            </div>
          ) : myHistory.map((r, i) => (
            <motion.div key={r._id}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card flex items-center justify-between">
              <div>
                <p className="font-medium dark:text-white">{r.date}</p>
                <p className="text-xs text-slate-400">
                  Checked in: {r.checkinTime ? new Date(r.checkinTime).toLocaleTimeString() : "N/A"}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                r.status === "present" ? "bg-green-100 text-green-700"
                : r.status === "absent" ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
              }`}>
                {r.status === "present" ? "✅ Present" : r.status === "absent" ? "❌ Absent" : "⏳ Pending"}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}