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
    api.get("/marks/my-marks").then(r => setMarks(r.data.marks || [])).catch(() => {});
    api.get("/students").then(r => {
      const s = r.data.students?.find(s => s.user?._id === user?._id || s.user?.email === user?.email);
      setStudent(s);
    }).catch(() => {});
  }, []);

  const mock = [
    { subject: "Data Structures", internal: 26, external: 58, total: 84, grade: "A+" },
    { subject: "DBMS", internal: 24, external: 52, total: 76, grade: "A" },
    { subject: "Operating System", internal: 22, external: 48, total: 70, grade: "A" },
    { subject: "Computer Networks", internal: 28, external: 62, total: 90, grade: "O" },
    { subject: "Software Engg", internal: 20, external: 44, total: 64, grade: "B+" },
  ];
  const display = marks.length > 0 ? marks : mock;
  const cgpa = (display.reduce((a, m) => a + (m.total / 10), 0) / display.length).toFixed(2);
  const totalObtained = display.reduce((a, m) => a + m.total, 0);
  const totalMax = display.length * 100;
  const percentage = ((totalObtained / totalMax) * 100).toFixed(2);

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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📄 Result Card</h1>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownload} className="btn-primary flex items-center gap-2">
          📥 Download
        </motion.button>
      </div>

      {/* Result Card */}
      <div ref={cardRef} className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-center">
          <h2 className="text-white text-2xl font-bold">College ERP System</h2>
          <p className="text-white/70 text-sm mt-1">Official Result Card</p>
        </div>

        {/* Student Info */}
        <div className="p-6 border-b border-slate-100 grid grid-cols-2 gap-4">
          {[
            { label: "Student Name", value: user?.name },
            { label: "Roll No", value: student?.rollNo || "N/A" },
            { label: "Branch", value: student?.branch || "N/A" },
            { label: "Semester", value: student?.semester ? `Semester ${student.semester}` : "N/A" },
            { label: "Academic Year", value: "2024-25" },
            { label: "Section", value: student?.section || "N/A" },
          ].map(f => (
            <div key={f.label}>
              <p className="text-xs text-slate-400">{f.label}</p>
              <p className="font-semibold text-slate-800">{f.value}</p>
            </div>
          ))}
        </div>

        {/* Marks Table */}
        <div className="p-6">
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-slate-50">
                {["Subject", "Internal (30)", "External (70)", "Total (100)", "Grade"].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {display.map((m, i) => (
                <tr key={i}>
                  <td className="px-3 py-2 font-medium text-slate-700">{m.subject}</td>
                  <td className="px-3 py-2 text-slate-600">{m.internal}</td>
                  <td className="px-3 py-2 text-slate-600">{m.external}</td>
                  <td className="px-3 py-2 font-bold text-slate-800">{m.total}</td>
                  <td className="px-3 py-2">
                    <span className={`font-bold ${m.grade === "F" ? "text-red-500" : m.grade === "O" ? "text-purple-600" : "text-emerald-600"}`}>
                      {m.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-xl p-4">
            {[
              { label: "Total Marks", value: `${totalObtained}/${totalMax}` },
              { label: "Percentage", value: `${percentage}%` },
              { label: "CGPA", value: cgpa },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold text-purple-600">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className={`font-bold text-lg ${percentage >= 40 ? "text-green-600" : "text-red-500"}`}>
              Result: {percentage >= 40 ? "✅ PASS" : "❌ FAIL"}
            </p>
          </div>
        </div>

        <div className="px-6 pb-4 text-center text-xs text-slate-400">
          Generated on {new Date().toLocaleDateString("en-IN")} · College ERP System
        </div>
      </div>
    </div>
  );
}