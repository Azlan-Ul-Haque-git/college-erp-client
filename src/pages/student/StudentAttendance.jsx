import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English", "Data Structures", "DBMS", "Operating System", "Computer Networks", "Software Engineering"];

export default function StudentAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [myRecords, setMyRecords] = useState([]);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    fetchMyAttendance();
    getLocation();
  }, []);

  const fetchMyAttendance = async () => {
    try {
      const { data } = await api.get("/attendance/my");
      setMyRecords(data.data || []);
    } catch { }
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setLocationError("GPS not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setLocationError("Location access denied! Please allow location."),
      { enableHighAccuracy: true }
    );
  };
  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      setStream(s);
      setCameraOn(true);
      // Wait for video element to render then set stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setMessage("Camera access denied! Please allow camera permission.");
      toast.error("Camera access denied!");
    }
  };
  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOn(false);
  };
  const takeSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) { toast.error("Camera not ready!"); return; }
    if (video.videoWidth === 0) { toast.error("Camera still loading, try again!"); return; }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const img = canvas.toDataURL("image/jpeg", 0.7);
    setSelfie(img);
    stopCamera();
  };

  const submitAttendance = async () => {
    if (!selfie) { toast.error("Take a selfie first!"); return; }
    if (!location) { toast.error("Allow location first!"); return; }
    setLoading(true); setMessage("");
    try {
      const { data } = await api.post("/attendance/student-checkin", {
        selfie, latitude: location.latitude, longitude: location.longitude, subject,
      });
      setSuccess(true);
      setMessage(data.message);
      setSelfie(null);
      toast.success("Attendance submitted! ✅");
      fetchMyAttendance();
    } catch (err) {
      setSuccess(false);
      setMessage(err.response?.data?.message || "Error occurred!");
      toast.error(err.response?.data?.message || "Failed");
    }
    setLoading(false);
  };

  const presentCount = myRecords.filter(r => r.status === "present").length;
  const totalCount = myRecords.filter(r => r.status !== "pending").length;
  const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📍 Mark Attendance</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Present", value: presentCount, color: "text-green-600" },
          { label: "Percentage", value: `${percentage}%`, color: "text-blue-600" },
          { label: "Total", value: myRecords.length, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Form */}
      <div className="card space-y-4">
        {/* Location */}
        <div className={`flex items-center gap-3 p-3 rounded-xl ${location ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
          <span>{location ? "✅" : "❌"}</span>
          <p className={`text-sm flex-1 ${location ? "text-green-700" : "text-red-600"}`}>
            {location ? `Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : locationError || "Getting location..."}
          </p>
          {!location && (
            <button onClick={getLocation} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-xl">
              Retry
            </button>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Subject *</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="input">
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Camera */}
        <div>
          {!cameraOn && !selfie && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={startCamera}
              className="w-full btn-primary py-3">
              📷 Open Camera
            </motion.button>
          )}
          {cameraOn && (
            <div className="text-center space-y-3">
              <video ref={videoRef} autoPlay playsInline muted
                onLoadedMetadata={() => videoRef.current?.play()}
                className="w-full max-w-xs mx-auto rounded-2xl border-4 border-purple-200" />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3 justify-center">
                <motion.button whileTap={{ scale: 0.95 }} onClick={takeSelfie}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold">
                  📸 Take Selfie
                </motion.button>
                <button onClick={stopCamera}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-white px-6 py-2.5 rounded-xl">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {selfie && (
            <div className="text-center space-y-2">
              <img src={selfie} alt="selfie"
                className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-green-400 shadow-lg" />
              <p className="text-green-600 font-semibold text-sm">✅ Selfie ready!</p>
              <button onClick={() => { setSelfie(null); startCamera(); }}
                className="text-xs text-blue-500 hover:underline">
                Retake
              </button>
            </div>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-xl text-sm ${success ? "bg-green-50 text-green-700 dark:bg-green-900/20" : "bg-red-50 text-red-700 dark:bg-red-900/20"}`}>
            {message}
          </div>
        )}

        {/* Submit */}
        <motion.button whileTap={{ scale: 0.97 }}
          onClick={submitAttendance}
          disabled={loading || !selfie || !location}
          className="w-full btn-primary py-3 text-base disabled:opacity-50">
          {loading ? "Submitting..." : "✅ Submit Attendance"}
        </motion.button>
      </div>

      {/* History */}
      <div className="card">
        <h3 className="font-semibold dark:text-white mb-4">Attendance History</h3>
        {myRecords.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No records yet</p>
        ) : (
          <div className="space-y-2">
            {myRecords.slice(0, 15).map(r => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-sm dark:text-white">{r.subject}</p>
                  <p className="text-xs text-slate-400">{r.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === "present" ? "bg-green-100 text-green-700"
                  : r.status === "absent" ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                  }`}>
                  {r.status === "present" ? "✅ Present" : r.status === "absent" ? "❌ Absent" : "⏳ Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}