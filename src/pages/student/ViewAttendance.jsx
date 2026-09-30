import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

export default function ViewAttendance() {
  const [summary, setSummary] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/attendance/my-summary")
      .then((r) => {
        const data = r.data.data || {};
        setSummary(data);
        setSubjects(data.subjects || []);
      })
      .catch((err) => {
        console.error("Attendance summary error:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-400">Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
        My Attendance
      </h1>

      {/* Overall Stats */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Classes", value: summary.total, color: "text-slate-700 dark:text-white" },
            { label: "Present", value: summary.present, color: "text-emerald-600" },
            { label: "Absent", value: summary.absent, color: "text-red-500" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card text-center"
            >
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value ?? 0}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Overall Percentage */}
      {summary && summary.total > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-white">
              Overall Attendance
            </h3>
            <span
              className={`text-2xl font-bold ${summary.percentage >= 75
                  ? "text-emerald-600"
                  : summary.percentage >= 60
                    ? "text-yellow-600"
                    : "text-red-500"
                }`}
            >
              {summary.percentage}%
            </span>
          </div>
          <div className="relative h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary.percentage}%` }}
              transition={{ duration: 0.8 }}
              className={`absolute h-full rounded-full ${summary.percentage >= 75
                  ? "bg-emerald-500"
                  : summary.percentage >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
            />
          </div>
          {summary.percentage < 75 && (
            <p className="text-xs text-red-500 mt-2">
              ⚠️ Below 75% — attend more classes!
            </p>
          )}
        </div>
      )}

      {/* Subject-wise Chart */}
      {subjects.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
            Subject-wise Attendance %
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjects} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="subject"
                tick={{ fontSize: 11 }}
                width={130}
              />
              <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
              <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                {subjects.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.percentage >= 75
                        ? "#059669"
                        : d.percentage >= 60
                          ? "#f59e0b"
                          : "#ef4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject Cards */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card"
            >
              <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-3">
                {s.subject}
              </h4>
              <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.percentage}%` }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.8 }}
                  className={`absolute h-full rounded-full ${s.percentage >= 75
                      ? "bg-emerald-500"
                      : s.percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {s.present}/{s.total} classes
                </span>
                <span
                  className={`font-bold ${s.percentage >= 75
                      ? "text-emerald-600"
                      : s.percentage >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                >
                  {s.percentage}%
                </span>
              </div>
              {s.percentage < 75 && (
                <p className="text-xs text-red-500 mt-2">
                  ⚠️ Below 75% — attend more classes!
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {summary && summary.total === 0 && (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400">No attendance records yet</p>
        </div>
      )}
    </div>
  );
}