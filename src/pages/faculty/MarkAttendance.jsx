import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Webcam from "react-webcam";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { CameraIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function MarkAttendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [form, setForm] = useState({ branch:"CSE", year:"2", semester:"3", section:"A", subject:"" });
  const [loading, setLoading] = useState(false);
  const [faceMode, setFaceMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    if (!form.branch || !form.year) return;
    api.get(`/students?branch=${form.branch}&year=${form.year}&section=${form.section}`)
      .then(r => {
        const list = r.data.students || [];
        setStudents(list);
        const init = {};
        list.forEach(s => init[s._id] = "Present");
        setAttendance(init);
      }).catch(() => {});
  }, [form.branch, form.year, form.section]);

  const toggle = (id) => {
    setAttendance(p => ({...p, [id]: p[id]==="Present" ? "Absent" : "Present"}));
  };

  const captureAndRecognize = async () => {
    const img = webcamRef.current?.getScreenshot();
    if (!img) { toast.error("Camera not ready"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/attendance/face-recognize", { image: img, studentIds: students.map(s=>s._id) });
      if (data.recognizedId) {
        setAttendance(p => ({...p, [data.recognizedId]: "Present"}));
        toast.success(`Face recognized: ${data.name}`);
      } else { toast.error("Face not recognized"); }
    } catch { toast.error("Recognition failed"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.subject) { toast.error("Please enter subject"); return; }
    setSubmitting(true);
    try {
      const records = students.map(s => ({ student: s._id, status: attendance[s._id] || "Absent", subject: form.subject, date: new Date(), markedBy: faceMode?"face":"manual" }));
      await api.post("/attendance/bulk", { records });
      toast.success("Attendance submitted!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const presentCount = Object.values(attendance).filter(v=>v==="Present").length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mark Attendance</h1>

      {/* Filters */}
      <div className="card grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label:"Branch", name:"branch", options:["CSE","IT","ECE","EE","ME"] },
          { label:"Year",   name:"year",   options:["1","2","3","4"] },
          { label:"Sem",    name:"semester",options:["1","2","3","4","5","6","7","8"] },
          { label:"Section",name:"section",options:["A","B","C","D"] },
        ].map(f => (
          <div key={f.name}>
            <label className="text-xs font-medium text-slate-500 mb-1 block">{f.label}</label>
            <select value={form[f.name]} onChange={e=>setForm(p=>({...p,[f.name]:e.target.value}))} className="input">
              {f.options.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Subject *</label>
          <input value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} className="input" placeholder="e.g. DBMS" />
        </div>
      </div>

      {/* Face Mode Toggle */}
      <div className="flex items-center gap-4">
        <button onClick={() => setFaceMode(f=>!f)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition ${faceMode ? "bg-purple-600 text-white" : "btn-secondary"}`}>
          <CameraIcon className="w-4 h-4" /> {faceMode ? "Face Mode ON" : "Enable Face Mode"}
        </button>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Present: <span className="font-bold text-emerald-600">{presentCount}</span> / {students.length}
        </div>
      </div>

      {/* Webcam */}
      {faceMode && (
        <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Face Recognition Attendance</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-xl w-full sm:w-72 h-48 object-cover" />
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">Point camera at student's face and click capture to auto-mark attendance.</p>
              <motion.button whileTap={{scale:0.95}} onClick={captureAndRecognize} disabled={loading}
                className="btn-primary flex items-center gap-2">
                <CameraIcon className="w-4 h-4" /> {loading ? "Recognizing..." : "Capture & Recognize"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Student list */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-white">Students ({students.length})</h3>
          <div className="flex gap-2">
            <button onClick={() => { const all={}; students.forEach(s=>all[s._id]="Present"); setAttendance(all); }} className="text-xs text-emerald-600 hover:underline">All Present</button>
            <span className="text-slate-300">|</span>
            <button onClick={() => { const all={}; students.forEach(s=>all[s._id]="Absent"); setAttendance(all); }} className="text-xs text-red-500 hover:underline">All Absent</button>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {students.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">Select filters to load students</p>
          ) : students.map((s,i) => (
            <motion.div key={s._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {s.user?.name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{s.user?.name}</p>
                  <p className="text-xs text-slate-400">{s.rollNo}</p>
                </div>
              </div>
              <button onClick={() => toggle(s._id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${attendance[s._id]==="Present" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                {attendance[s._id]==="Present" && <CheckIcon className="w-3 h-3" />}
                {attendance[s._id] || "Absent"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {students.length > 0 && (
        <motion.button whileTap={{scale:0.98}} onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-3 text-base">
          {submitting ? "Submitting..." : "Submit Attendance"}
        </motion.button>
      )}
    </div>
  );
}
