import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";

export default function ViewMarks() {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/marks/my-marks").then(r => setMarks(r.data.marks||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const mock = [
    { subject:"Data Structures", internal:26, external:58, total:84, grade:"A+" },
    { subject:"DBMS",            internal:24, external:52, total:76, grade:"A"  },
    { subject:"Operating System",internal:22, external:48, total:70, grade:"A"  },
    { subject:"Computer Networks",internal:28,external:62, total:90, grade:"O"  },
    { subject:"Software Engg",   internal:20, external:44, total:64, grade:"B+" },
  ];
  const display = marks.length > 0 ? marks : mock;
  const cgpa = (display.reduce((a,m) => a + (m.total/10), 0) / display.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Marks</h1>
        <div className="card !p-3 text-center">
          <p className="text-xs text-slate-500">CGPA</p>
          <p className="text-2xl font-bold text-purple-600">{cgpa}</p>
        </div>
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Subject","Internal (30)","External (70)","Total (100)","Grade"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {display.map((m,i) => (
                <motion.tr key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.05}}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{m.subject}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.internal}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{m.external}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{m.total}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-base ${m.grade==="F"?"text-red-500":m.grade==="O"?"text-purple-600":"text-emerald-600"}`}>{m.grade}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
