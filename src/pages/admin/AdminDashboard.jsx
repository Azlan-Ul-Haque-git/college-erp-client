import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../../components/Layout";
import StatCard from "../../components/StatCard";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { UsersIcon, AcademicCapIcon, BanknotesIcon, BellIcon } from "@heroicons/react/24/outline";
import api from "../../utils/axiosInstance";
import ManageStudents from "./ManageStudents";
import ManageFaculty from "./ManageFaculty";
import ManageFees from "./ManageFees";
import ManageNotices from "./ManageNotices";

const COLORS = ["#7c3aed","#2563eb","#059669","#f59e0b"];

const attendanceData = [
  { day:"Mon", present:85, absent:15 },
  { day:"Tue", present:90, absent:10 },
  { day:"Wed", present:78, absent:22 },
  { day:"Thu", present:92, absent:8 },
  { day:"Fri", present:88, absent:12 },
];
const feeData = [
  { month:"Jan", collected:45000 },
  { month:"Feb", collected:52000 },
  { month:"Mar", collected:48000 },
  { month:"Apr", collected:61000 },
  { month:"May", collected:55000 },
];
const branchData = [
  { name:"CSE", value:120 },
  { name:"IT",  value:95 },
  { name:"ECE", value:80 },
  { name:"ME",  value:60 },
];

function DashboardHome() {
  const [stats, setStats] = useState({ students:0, faculty:0, fees:0, notices:0 });

  useEffect(() => {
    api.get("/students").then(r => setStats(p=>({...p, students: r.data.count || 0}))).catch(()=>{});
    api.get("/faculty").then(r => setStats(p=>({...p, faculty: r.data.count || 0}))).catch(()=>{});
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.students || "248"} subtitle="+12 this month" icon={AcademicCapIcon} color="from-violet-500 to-purple-600" delay={0} />
        <StatCard title="Total Faculty"  value={stats.faculty  || "32"}  subtitle="8 departments"  icon={UsersIcon}         color="from-blue-500 to-cyan-600"    delay={0.1} />
        <StatCard title="Fees Collected" value="₹2.4L"                   subtitle="This semester"  icon={BanknotesIcon}     color="from-emerald-500 to-teal-600" delay={0.2} />
        <StatCard title="Active Notices" value="14"                       subtitle="3 urgent"       icon={BellIcon}          color="from-orange-500 to-amber-600" delay={0.3} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceData}>
              <defs>
                <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="present" stroke="#7c3aed" fill="url(#gPresent)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Branch-wise Students</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={branchData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {branchData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 flex-wrap mt-2">
            {branchData.map((b,i) => (
              <div key={b.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i%COLORS.length] }} />
                {b.name}: {b.value}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fee chart */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }} className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Monthly Fee Collection (₹)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={feeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize:12 }} />
            <YAxis tick={{ fontSize:12 }} />
            <Tooltip />
            <Bar dataKey="collected" fill="#7c3aed" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent activity */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }} className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { text:"New student registered: Rahul Sharma (CSE-3A)", time:"2 min ago", color:"bg-purple-500" },
            { text:"Attendance marked for IT-2B by Prof. Gupta",    time:"15 min ago", color:"bg-blue-500" },
            { text:"Fee payment received: ₹45,000 (Priya Verma)",  time:"1 hr ago",   color:"bg-emerald-500" },
            { text:"New notice posted: Mid-term exam schedule",     time:"2 hr ago",   color:"bg-orange-500" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">{item.text}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="students/*" element={<ManageStudents />} />
        <Route path="faculty/*"  element={<ManageFaculty />} />
        <Route path="fees/*"     element={<ManageFees />} />
        <Route path="notices/*"  element={<ManageNotices />} />
        <Route path="*"          element={<DashboardHome />} />
      </Routes>
    </Layout>
  );
}
