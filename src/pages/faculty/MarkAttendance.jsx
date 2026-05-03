import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/axiosInstance";

const fmt = d =>
  d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";

export default function StudentAttendance() {

  const { user } = useAuth();

  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [previewStream, setPreviewStream] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const refresh = async () => {
    try {
      const { data } = await api.get("/attendance/my-status");
      setToday(data.data || null);
    } catch { }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  /* ✅ CHECK IN */
  const checkIn = () => {
    setActionLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let stream;
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });

          setPreviewStream(stream);

          const video = document.createElement("video");
          video.srcObject = stream;
          await video.play();

          await new Promise(r => setTimeout(r, 300));

          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          canvas.getContext("2d").drawImage(video, 0, 0);

          const image = canvas.toDataURL("image/jpeg", 0.9);

          stream.getTracks().forEach(t => t.stop());
          setPreviewStream(null);

          const { data } = await api.post("/attendance/checkin", {
            lat,
            lng,
            image
          });

          setToday(data.data);
          showToast(data.message);

        } catch (err) {
          if (stream) stream.getTracks().forEach(t => t.stop());
          setPreviewStream(null);
          showToast(err?.response?.data?.message || "Check-in failed", false);
        }

        setActionLoading(false);
      },
      () => {
        showToast("Location denied", false);
        setActionLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  /* ✅ CHECK OUT */
  const checkOut = () => {
    setActionLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        let stream;
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });

          setPreviewStream(stream);

          const video = document.createElement("video");
          video.srcObject = stream;
          await video.play();

          await new Promise(r => setTimeout(r, 300));

          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          canvas.getContext("2d").drawImage(video, 0, 0);

          const image = canvas.toDataURL("image/jpeg");

          stream.getTracks().forEach(t => t.stop());
          setPreviewStream(null);

          const { data } = await api.post("/attendance/checkout", {
            lat,
            lng,
            image
          });

          setToday(data.data);
          showToast(data.message);

        } catch (err) {
          if (stream) stream.getTracks().forEach(t => t.stop());
          setPreviewStream(null);
          showToast(err?.response?.data?.message || "Checkout failed", false);
        }

        setActionLoading(false);
      },
      () => {
        showToast("Location denied", false);
        setActionLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const checkedIn = !!today?.checkIn?.time;
  const checkedOut = !!today?.checkOut?.time;

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white ${toast.ok ? "bg-green-500" : "bg-red-500"
              }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-2xl font-bold">📅 My Attendance</h1>

      <div className="card space-y-4">

        <p>Today — {fmtDate(new Date())}</p>

        {previewStream && (
          <video
            autoPlay
            playsInline
            ref={(video) => {
              if (video) video.srcObject = previewStream;
            }}
            className="w-full rounded-lg"
          />
        )}

        <div className="flex gap-6">
          <TimeBlock label="Check In" value={fmt(today?.checkIn?.time)} />
          <TimeBlock label="Check Out" value={fmt(today?.checkOut?.time)} />
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

function TimeBlock({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}