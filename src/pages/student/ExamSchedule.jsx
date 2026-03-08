import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";

export default function ExamSchedule() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/exams/student").then(r => setExams(r.data.exams || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const mock = [
    { subject: "Data Structures", examType: "Mid-term", examDate: "2025-03-15", startTime: "10:00 AM", endTime: "1:00 PM", room: "CS-101", totalMarks: 70 },
    { subject: "DBMS", examType: "Mid-term", examDate: "2025-03-17", startTime: "10:00 AM", endTime: "1:00 PM", room: "CS-102", totalMarks: 70 },
    { subject: "Operating System", examType: "Mid-term", examDate: "2025-03-19", startTime: "2:00 PM", endTime: "5:00 PM", room: "CS-201", totalMarks: 70 },
    { subject: "Computer Networks", examType: "End-term", examDate: "2025-04-10", startTime: "10:00 AM", endTime: "1:00 PM", room: "CS-301", totalMarks: 100 },
    { subject: "Software Engg", examType: "Practical", examDate: "2025-04-15", startTime: "9:00 AM", endTime: "12:00 PM", room: "Lab-1", totalMarks: 50 },
  ];
  const display = exams.length > 0 ? exams : mock;

  const typeColor = (t) =>
    t === "Mid-term" ? "bg-blue-100 text-blue-700" :
    t === "End-term" ? "bg-red-100 text-red-700" :
    t === "Practical" ? "bg-green-100 text-green-700" :
    t === "Quiz" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600";

  const isUpcoming = (date) => new Date(date) > new Date();
  const daysLeft = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📅 Exam Schedule</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Exams", value: display.length, color: "text-purple-600" },
          { label: "Upcoming", value: display.filter(e => isUpcoming(e.examDate)).length, color: "text-blue-600" },
          { label: "Mid-terms", value: display.filter(e => e.examType === "Mid-term").length, color: "text-orange-600" },
          { label: "End-terms", value: display.filter(e => e.examType === "End-term").length, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-center text-slate-400 py-8">Loading...</p>
        : display.map((e, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`card border-l-4 ${isUpcoming(e.examDate) ? "border-l-purple-500" : "border-l-slate-300"}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 dark:text-white">{e.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(e.examType)}`}>
                    {e.examType}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>📅 {new Date(e.examDate).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                  {e.startTime && <span>⏰ {e.startTime} - {e.endTime}</span>}
                  {e.room && <span>🚪 Room: {e.room}</span>}
                  <span>📝 Total: {e.totalMarks} marks</span>
                </div>
                {e.instructions && <p className="text-xs text-slate-400 mt-1">📌 {e.instructions}</p>}
              </div>
              {isUpcoming(e.examDate) && (
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={`text-lg font-bold ${daysLeft(e.examDate) <= 3 ? "text-red-500" : "text-purple-600"}`}>
                    {daysLeft(e.examDate)}
                  </p>
                  <p className="text-xs text-slate-400">days left</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}