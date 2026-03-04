import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English"];

export default function MarkAttendance() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [facultyCheckin, setFacultyCheckin] = useState(false);
  const [message, setMessage] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/attendance/pending?subject=${subject}&date=${date}`);
      setPending(data.data);
    } catch (err) { }
    setLoading(false);
  };

  const verifyAttendance = async (id, status) => {
    try {
      await axios.put(`/attendance/verify/${id}`, { status });
      setPending((prev) => prev.filter((p) => p._id !== id));
      setMessage(`✅ ${status === "present" ? "Present" : "Absent"} mark ho gaya!`);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setMessage("Error aaya!");
    }
  };

  const markFacultyAttendance = async () => {
    if (!navigator.geolocation) return setMessage("GPS nahi hai!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { data } = await axios.post("/attendance/faculty-checkin", {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setFacultyCheckin(true);
        setMessage(data.message);
      } catch (err) {
        setMessage(err.response?.data?.message || "Error!");
      }
    }, () => setMessage("Location allow karo!"), { enableHighAccuracy: true });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">✅ Attendance Verify Karo</h1>

      {/* Faculty own attendance */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-5 mb-6 text-white">
        <h2 className="font-bold text-lg mb-2">Meri Apni Attendance</h2>
        <p className="text-sm opacity-80 mb-3">Aaj college aa gaye ho? Location se verify karo!</p>
        {!facultyCheckin ? (
          <button onClick={markFacultyAttendance} className="bg-white text-purple-700 px-5 py-2 rounded-xl font-bold">
            📍 Meri Attendance Mark Karo
          </button>
        ) : (
          <div className="bg-green-400/30 px-4 py-2 rounded-xl inline-block font-bold">
            ✅ Aaj ki attendance ho gayi!
          </div>
        )}
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</div>
      )}

      {/* Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            >
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-2 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
        <button
          onClick={fetchPending}
          className="w-full bg-purple-600 text-white py-2 rounded-xl font-semibold"
        >
          🔍 Students Dekho
        </button>
      </div>

      {/* Pending List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">
          Pending Verification ({pending.length})
        </h2>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Koi pending nahi hai! 🎉</p>
        ) : (
          <div className="space-y-4">
            {pending.map((p) => (
              <div key={p._id} className="border dark:border-gray-600 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  {/* Selfie */}
                  {p.selfie ? (
                    <img
                      src={p.selfie}
                      alt="selfie"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-3xl">
                      👤
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-bold dark:text-white">
                      {p.student?.user?.name || "Student"}
                    </p>
                    <p className="text-sm text-gray-500">{p.student?.user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Roll No: {p.student?.rollNumber} | Branch: {p.student?.branch}
                    </p>
                    <p className="text-xs text-gray-400">
                      ⏰ {p.checkinTime ? new Date(p.checkinTime).toLocaleTimeString() : "N/A"}
                    </p>
                    <p className="text-xs text-green-600">
                      📍 {p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => verifyAttendance(p._id, "present")}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-600"
                    >
                      ✅ Present
                    </button>
                    <button
                      onClick={() => verifyAttendance(p._id, "absent")}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-600"
                    >
                      ❌ Absent
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}