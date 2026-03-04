import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ViewAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/attendance/my-summary").then(r => setData(r.data.summary || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const mock = [
    { subject:"Data Structures", present:38, total:42, percentage:90 },
    { subject:"DBMS",            present:30, total:40, percentage:75 },
    { subject:"Operating System",present:25, total:38, percentage:66 },
    { subject:"Computer Networks",present:36,total:40, percentage:90 },
    { subject:"Software Engg",   present:20, total:35, percentage:57 },
  ];
  const display = data.length > 0 ? data : mock;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Attendance</h1>
      <div className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Subject-wise Attendance %</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={display} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0,100]} tick={{fontSize:11}} />
            <YAxis type="category" dataKey="subject" tick={{fontSize:11}} width={130} />
            <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
            <Bar dataKey="percentage" radius={[0,6,6,0]}>
              {display.map((d,i) => <Cell key={i} fill={d.percentage>=75?"#059669":d.percentage>=60?"#f59e0b":"#ef4444"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {display.map((s,i) => (
          <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="card">
            <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-3">{s.subject}</h4>
            <div className="relative h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
              <motion.div initial={{width:0}} animate={{width:`${s.percentage}%`}} transition={{delay:0.3+i*0.05, duration:0.8}}
                className={`absolute h-full rounded-full ${s.percentage>=75?"bg-emerald-500":s.percentage>=60?"bg-yellow-500":"bg-red-500"}`} />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{s.present}/{s.total} classes</span>
              <span className={`font-bold ${s.percentage>=75?"text-emerald-600":s.percentage>=60?"text-yellow-600":"text-red-600"}`}>{s.percentage}%</span>
            </div>
            {s.percentage < 75 && <p className="text-xs text-red-500 mt-2">⚠️ Below 75% — attend more classes!</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
