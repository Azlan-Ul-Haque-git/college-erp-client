import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

const EMPTY = { subject: "", examType: "Mid-term", branch: "ALL", semester: 1, examDate: "", startTime: "", endTime: "", room: "", totalMarks: 100, instructions: "" };

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try { const { data } = await api.get("/exams/all"); setExams(data.exams || []); }
    catch { }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post("/exams", form);
      toast.success("Exam added!"); setModal(false); fetch();
    } catch { toast.error("Failed"); }
    finally { setSubmitting(false); }
  };

  const typeColor = (t) => t === "Mid-term" ? "bg-blue-100 text-blue-700" : t === "End-term" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📅 Exam Schedule</h1>
          <p className="text-slate-500 text-sm">{exams.length} exams scheduled</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setForm(EMPTY); setModal(true); }}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Exam
        </motion.button>
      </div>

      <div className="space-y-3">
        {exams.map((e, i) => (
          <motion.div key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
            className="card flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold dark:text-white">{e.subject}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(e.examType)}`}>{e.examType}</span>
              </div>
              <p className="text-xs text-slate-500">
                {new Date(e.examDate).toLocaleDateString("en-IN")} · {e.startTime} - {e.endTime} · Room: {e.room} · {e.branch} · Sem {e.semester}
              </p>
            </div>
            <button onClick={async () => { await api.delete(`/exams/${e._id}`); fetch(); }}
              className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg ml-3">
              <TrashIcon className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-lg font-bold dark:text-white">Add Exam</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Subject *</label>
                    <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Exam Type</label>
                    <select value={form.examType} onChange={e => setForm(p => ({ ...p, examType: e.target.value }))} className="input">
                      {["Mid-term","End-term","Quiz","Practical","Assignment"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Branch</label>
                    <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} className="input">
                      {["ALL","CSE","IT","ECE","EE","ME","CE"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Semester</label>
                    <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: +e.target.value }))} className="input">
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Exam Date *</label>
                    <input type="date" value={form.examDate} onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))} required className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Room</label>
                    <input type="text" value={form.room} onChange={e => setForm(p => ({ ...p, room: e.target.value }))} className="input" placeholder="CS-101" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Start Time</label>
                    <input type="text" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="input" placeholder="10:00 AM" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">End Time</label>
                    <input type="text" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="input" placeholder="1:00 PM" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Instructions</label>
                  <textarea value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
                    rows={2} className="input resize-none" placeholder="No books allowed..." />
                </div>
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Adding..." : "Add Exam"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}