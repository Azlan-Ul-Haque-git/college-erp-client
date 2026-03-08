import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/assignments/student").then(r => setAssignments(r.data.assignments || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const isOverdue = (date) => date && new Date(date) < new Date();
  const daysLeft = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📝 Assignments</h1>
        <p className="text-slate-500 text-sm">{assignments.length} assignments</p>
      </div>

      {loading ? <p className="text-center text-slate-400 py-8">Loading...</p>
      : assignments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-slate-400">No assignments available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`card border-l-4 ${isOverdue(a.dueDate) ? "border-l-red-400" : "border-l-purple-400"}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800 dark:text-white">{a.title}</h3>
                {a.dueDate && (
                  <span className={`text-xs px-2 py-1 rounded-full font-bold flex-shrink-0 ml-2 ${isOverdue(a.dueDate) ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {isOverdue(a.dueDate) ? "Overdue" : `${daysLeft(a.dueDate)}d left`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-2">{a.subject} · {a.branch} · Sem {a.semester}</p>
              {a.description && <p className="text-sm text-slate-500 mb-3">{a.description}</p>}
              <div className="flex items-center justify-between">
                {a.dueDate && (
                  <p className="text-xs text-slate-400">
                    Due: {new Date(a.dueDate).toLocaleDateString("en-IN")}
                  </p>
                )}
                {a.fileUrl && (
                  <a href={a.fileUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-purple-600 hover:underline">📎 View</a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}