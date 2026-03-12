import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axiosInstance";

const fmt = d => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN") : "—";

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

  /* fetch attendance */

  const refresh = async () => {
    try {
      const [s, r] = await Promise.all([
        api.get("/attendance/my-status"),
        api.get("/attendance")
      ]);

      setToday(s.data.data || null);
      setRecords(r.data.data || []);

    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh() }, []);


  /* FACE + LOCATION CHECKIN */

  const checkIn = async () => {

    setActionLoading(true);

    try {

      if (!navigator.geolocation) {
        showToast("Location not supported", false);
        return;
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        /* camera open */

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        const video = document.createElement("video");
        video.srcObject = stream;

        await video.play();

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        canvas.getContext("2d").drawImage(video, 0, 0);

        const image = canvas.toDataURL("image/jpeg");

        stream.getTracks().forEach(t => t.stop());

        /* send to backend */

        const { data } = await api.post("/attendance/checkin", {
          lat,
          lng,
          image
        });

        setToday(data.data);

        showToast("✅ Face verified & attendance marked");

      });

    } catch (err) {

      showToast(err.response?.data?.message || "Check-in failed", false);

    }
    finally {
      setActionLoading(false);
    }

  };


  /* FACE CHECKOUT */

  const checkOut = async () => {

    setActionLoading(true);

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const video = document.createElement("video");
      video.srcObject = stream;

      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext("2d").drawImage(video, 0, 0);

      const image = canvas.toDataURL("image/jpeg");

      stream.getTracks().forEach(t => t.stop());

      const { data } = await api.post("/attendance/checkout", { image });

      setToday(data.data);

      showToast("✅ Checked out");

    } catch (err) {

      showToast(err.response?.data?.message || "Checkout failed", false);

    }
    finally {
      setActionLoading(false);
    }

  };


  const checkedIn = !!today?.checkIn?.time;
  const checkedOut = !!today?.checkOut?.time;


  if (loading) {
    return <div className="text-center py-10">Loading attendance...</div>
  }

  return (

    <div className="space-y-6 max-w-3xl mx-auto">

      {/* toast */}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white ${toast.ok ? "bg-emerald-500" : "bg-red-500"
              }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>


      <h1 className="text-2xl font-bold">📅 My Attendance</h1>


      <div className="card space-y-4">

        <p>Today — {fmtDate(new Date())}</p>

        <div className="flex gap-6">

          <TimeBlock
            label="Check In"
            value={checkedIn ? fmt(today.checkIn.time) : "—"}
            active={checkedIn}
            color="text-green-500"
          />

          <TimeBlock
            label="Check Out"
            value={checkedOut ? fmt(today.checkOut.time) : "—"}
            active={checkedOut}
            color="text-purple-500"
          />

        </div>


        <div className="flex gap-3">

          <button
            onClick={checkIn}
            disabled={checkedIn || actionLoading}
            className="btn-primary flex-1"
          >
            {checkedIn ? "Checked In" : "Check In"}
          </button>

          <button
            onClick={checkOut}
            disabled={!checkedIn || checkedOut || actionLoading}
            className="btn-primary flex-1"
          >
            {checkedOut ? "Checked Out" : "Check Out"}
          </button>

        </div>

      </div>

    </div>

  );

}

function TimeBlock({ label, value, active, color }) {

  return (

    <div className="flex flex-col items-center">

      <p className="text-xs text-gray-400">{label}</p>

      <p className={`text-lg font-bold ${active ? color : "text-gray-300"}`}>
        {value}
      </p>

    </div>

  );

}