import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";

export default function UploadMarks() {
  const [students, setStudents] = useState([]);
  const [marks, setMarks]       = useState({});
  const [form, setForm]         = useState({ branch:"CSE", year:"2", semester:"3", section:"A", subject:"" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!form.branch || !form.year) return;
    api.get(`/students?branch=${form.branch}&year=${form.year}&section=${form.section}`)
      .then(r => { setStudents(r.data.students||[]); setMarks({}); })
      .catch(() => {});
  }, [form.branch, form.year, form.section]);

  const setMark = (id, field, val) => setMarks(p => ({ ...p, [id]: { ...p[id], [field]: val } }));

  const handleSubmit = async () => {
    if (!form.subject) { toast.error("Enter subject name"); return; }
    setSubmitting(true);
    try {
      const records = students.map(s => ({
        student: s._id, subject: form.subject, semester: +form.semester,
        internal: +(marks[s._id]?.internal || 0), external: +(marks[s._id]?.external || 0),
      }));
      await api.post("/marks/bulk", { records });
      toast.success("Marks uploaded!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Upload Marks</h1>
      <div className="card grid grid-cols-2 sm:grid-cols-5 gap-4">
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
          <input value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} className="input" placeholder="Subject name" />
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Roll No","Name","Internal (0-30)","External (0-70)","Total","Grade"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {students.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400">Select filters to load students</td></tr>
              ) : students.map((s,i) => {
                const int = +(marks[s._id]?.internal||0), ext = +(marks[s._id]?.external||0), total = int+ext;
                const grade = total>=90?"O":total>=80?"A+":total>=70?"A":total>=60?"B+":total>=50?"B":total>=40?"C":"F";
                return (
                  <motion.tr key={s._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 text-slate-500">{s.rollNo}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{s.user?.name}</td>
                    <td className="px-4 py-2 w-28">
                      <input type="number" min="0" max="30" value={marks[s._id]?.internal||""} onChange={e=>setMark(s._id,"internal",e.target.value)} className="input text-center" placeholder="0" />
                    </td>
                    <td className="px-4 py-2 w-28">
                      <input type="number" min="0" max="70" value={marks[s._id]?.external||""} onChange={e=>setMark(s._id,"external",e.target.value)} className="input text-center" placeholder="0" />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{total}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${grade==="F"?"text-red-500":grade==="O"?"text-purple-600":"text-emerald-600"}`}>{grade}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {students.length > 0 && (
        <motion.button whileTap={{scale:0.98}} onClick={handleSubmit} disabled={submitting} className="btn-primary w-full py-3 text-base">
          {submitting ? "Uploading..." : "Upload Marks"}
        </motion.button>
      )}
    </div>
  );
}
