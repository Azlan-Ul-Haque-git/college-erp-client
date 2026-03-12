import { useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import api from "../../utils/axiosInstance";

export default function ResultCard() {
  const { user } = useAuth();
  const cardRef = useRef();
  const [marks, setMarks] = useState([]);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    api.get("/marks/my-marks").then(r => setMarks(r.data.marks || [])).catch(() => { });
    api.get("/students").then(r => {
      const s = r.data.students?.find(
        s => s.user?._id === user?._id || s.user?.email === user?.email
      );
      setStudent(s);
    }).catch(() => { });
  }, []);

  const mock = [
    { subject: "Data Structures", internal: 26, external: 58, total: 84, grade: "A+" },
    { subject: "DBMS", internal: 24, external: 52, total: 76, grade: "A" },
    { subject: "Operating System", internal: 22, external: 48, total: 70, grade: "A" },
    { subject: "Computer Networks", internal: 28, external: 62, total: 90, grade: "O" },
    { subject: "Software Engg", internal: 20, external: 44, total: 64, grade: "B+" },
  ];
  const display = marks.length > 0 ? marks : mock;
  const totalObtained = display.reduce((a, m) => a + m.total, 0);
  const totalMax = display.length * 100;
  const percentage = ((totalObtained / totalMax) * 100).toFixed(2);
  const cgpa = (display.reduce((a, m) => a + m.total / 10, 0) / display.length).toFixed(2);

  const gradeColor = g =>
    g === "F" ? "text-red-500" : g === "O" ? "text-purple-600" : "text-emerald-600";

  const handleDownload = () => {
    import("html2canvas").then(({ default: html2canvas }) => {
      html2canvas(cardRef.current, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        const link = document.createElement("a");
        link.download = `Result-Card-${user?.name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  };

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto px-2 sm:px-0">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
          📄 Result Card
        </h1>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2 text-sm px-3 py-2 sm:px-4 sm:py-2"
        >
          📥 <span className="hidden sm:inline">Download</span>
        </motion.button>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl
                   border border-slate-200 dark:border-slate-700"
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-5 text-center">
          <h2 className="text-white text-lg sm:text-2xl font-bold">College ERP System</h2>
          <p className="text-white/70 text-xs sm:text-sm mt-1">Official Result Card</p>
        </div>

        {/* Student info — 1 col on xs, 2 col on sm+ */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700
                        grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Student Name", value: user?.name },
            { label: "Roll No", value: student?.rollNo || "N/A" },
            { label: "Branch", value: student?.branch || "N/A" },
            { label: "Semester", value: student?.semester ? `Semester ${student.semester}` : "N/A" },
            { label: "Academic Year", value: "2024-25" },
            { label: "Section", value: student?.section || "N/A" },
          ].map(f => (
            <div key={f.label} className="min-w-0">
              <p className="text-xs text-slate-400 dark:text-slate-500">{f.label}</p>
              <p className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base truncate">
                {f.value}
              </p>
            </div>
          ))}
        </div>

        {/* Marks table — horizontally scrollable on mobile */}
        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full text-xs sm:text-sm min-w-[420px] mb-4 sm:mb-6">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  {["Subject", "Internal\n(30)", "External\n(70)", "Total\n(100)", "Grade"].map(h => (
                    <th
                      key={h}
                      className="text-left px-2 sm:px-3 py-2 text-xs font-semibold
                                 text-slate-500 dark:text-slate-400 uppercase whitespace-pre-line"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {display.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-2 sm:px-3 py-2 font-medium text-slate-700 dark:text-slate-300
                                   max-w-[120px] truncate">
                      {m.subject}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-slate-600 dark:text-slate-400 text-center">
                      {m.internal}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-slate-600 dark:text-slate-400 text-center">
                      {m.external}
                    </td>
                    <td className="px-2 sm:px-3 py-2 font-bold text-slate-800 dark:text-white text-center">
                      {m.total}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-center">
                      <span className={`font-bold text-sm ${gradeColor(m.grade)}`}>
                        {m.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary — 1 col xs, 3 col sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/50
                          rounded-xl p-3 sm:p-4">
            {[
              { label: "Total Marks", value: `${totalObtained}/${totalMax}` },
              { label: "Percentage", value: `${percentage}%` },
              { label: "CGPA", value: cgpa },
            ].map(s => (
              <div key={s.label}
                className="flex sm:flex-col items-center sm:items-center
                           justify-between sm:justify-center gap-2 sm:gap-0
                           bg-white dark:bg-slate-700/50 rounded-lg px-3 py-2 sm:py-3
                           sm:text-center"
              >
                <p className="text-xs text-slate-400 dark:text-slate-500 sm:order-last sm:mt-1">
                  {s.label}
                </p>
                <p className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="mt-4 text-center">
            <span
              className={`inline-block font-bold text-base sm:text-lg px-6 py-2 rounded-full
                ${percentage >= 40
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                }`}
            >
              {percentage >= 40 ? "✅ PASS" : "❌ FAIL"}
            </span>
          </div>
        </div>

        <div className="px-4 pb-4 text-center text-xs text-slate-400 dark:text-slate-500">
          Generated on {new Date().toLocaleDateString("en-IN")} · College ERP System
        </div>
      </div>
    </div>
  );
}