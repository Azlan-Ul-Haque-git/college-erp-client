import { Routes, Route } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { ClipboardDocumentListIcon, ChartBarIcon, BanknotesIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import ViewAttendance from "./ViewAttendance";
import ViewMarks from "./ViewMarks";
import ViewFees from "./ViewFees";
import AIPrediction from "./AIPrediction";

const radarData = [
  { subject:"Math",    score:85 },
  { subject:"DBMS",    score:72 },
  { subject:"OS",      score:90 },
  { subject:"DSA",     score:68 },
  { subject:"CN",      score:78 },
  { subject:"SE",      score:82 },
];

function StudentHome() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <motion.div initial={{opacity:0}} animate={{opacity:1}}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome, {user?.name?.split(" ")[0]}! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Here's your academic overview.</p>
      </motion.div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Attendance"  value="84%"  subtitle="Target: 75%" icon={ClipboardDocumentListIcon} color="from-violet-500 to-purple-600" delay={0} />
        <StatCard title="CGPA"        value="7.8"  subtitle="Current sem" icon={AcademicCapIcon}            color="from-blue-500 to-cyan-600"    delay={0.1} />
        <StatCard title="Fee Status"  value="Paid" subtitle="This semester" icon={BanknotesIcon}           color="from-emerald-500 to-teal-600" delay={0.2} />
        <StatCard title="Rank"        value="#12"  subtitle="In class"    icon={ChartBarIcon}               color="from-orange-500 to-amber-600" delay={0.3} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:11 }} />
              <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Notices</h3>
          <div className="space-y-3">
            {[
              { title:"Mid-term Exam Schedule Released", cat:"exam",    time:"Today" },
              { title:"Holiday on 15th March",          cat:"holiday", time:"1 day ago" },
              { title:"Project submission deadline",    cat:"urgent",  time:"2 days ago" },
            ].map((n,i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.cat==="urgent"?"bg-red-500":n.cat==="exam"?"bg-yellow-500":"bg-emerald-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{n.title}</p>
                  <p className="text-xs text-slate-400">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard"  element={<StudentHome />} />
        <Route path="attendance" element={<ViewAttendance />} />
        <Route path="marks"      element={<ViewMarks />} />
        <Route path="fees"       element={<ViewFees />} />
        <Route path="ai"         element={<AIPrediction />} />
        <Route path="*"          element={<StudentHome />} />
      </Routes>
    </Layout>
  );
}
