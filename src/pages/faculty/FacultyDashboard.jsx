import { Routes, Route } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { motion } from "framer-motion";
import { ClipboardDocumentListIcon, ChartBarIcon, BellIcon, CalendarIcon } from "@heroicons/react/24/outline";
import MarkAttendance from "./MarkAttendance";
import UploadMarks from "./UploadMarks";

function FacultyHome() {
  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0}} animate={{opacity:1}}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Faculty Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage attendance, marks and more.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="My Students"   value="120" icon={ClipboardDocumentListIcon} color="from-blue-500 to-cyan-600"   delay={0} />
        <StatCard title="Classes Today" value="4"   icon={CalendarIcon}              color="from-violet-500 to-purple-600" delay={0.1} />
        <StatCard title="Avg Attendance" value="84%" icon={ChartBarIcon}             color="from-emerald-500 to-teal-600" delay={0.2} />
        <StatCard title="Notices"        value="3"   icon={BellIcon}                 color="from-orange-500 to-amber-600" delay={0.3} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {[
              { time:"9:00 AM",  subj:"Data Structures",   room:"CS-101", branch:"CSE-2A" },
              { time:"11:00 AM", subj:"DBMS",              room:"CS-102", branch:"IT-3B"  },
              { time:"2:00 PM",  subj:"Operating Systems", room:"CS-201", branch:"CSE-3A" },
            ].map((c,i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 w-16 flex-shrink-0">{c.time}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{c.subj}</p>
                  <p className="text-xs text-slate-400">{c.branch} · Room {c.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {[
              { subj:"Data Structures", date:"Today",     present:42, total:45 },
              { subj:"DBMS",            date:"Yesterday", present:38, total:40 },
              { subj:"OS",              date:"Mon",       present:40, total:44 },
            ].map((r,i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{r.subj}</p>
                  <p className="text-xs text-slate-400">{r.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-emerald-600">{r.present}/{r.total}</p>
                  <p className="text-xs text-slate-400">{Math.round(r.present/r.total*100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FacultyDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard"   element={<FacultyHome />} />
        <Route path="attendance"  element={<MarkAttendance />} />
        <Route path="marks"       element={<UploadMarks />} />
        <Route path="*"           element={<FacultyHome />} />
      </Routes>
    </Layout>
  );
}
