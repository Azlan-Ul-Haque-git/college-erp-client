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
import LeaveManagement from "./LeaveManagement";
import ExamManagement from "./ExamManagement";
import GrievanceManagement from "./GrievanceManagement";
import ManageTimetable from "./ManageTimetable";
import RegistrationRequests from "./RegistrationRequests";

const COLORS = ["#7c3aed", "#2563eb", "#059669", "#f59e0b"];

function DashboardHome() {
  const [stats, setStats] = useState({ students: 0, faculty: 0 });
  const [attendance, setAttendance] = useState([]);
  const [facultyAttendance, setFacultyAttendance] = useState([]);

  useEffect(() => {
    api.get("/students").then(r => setStats(p => ({ ...p, students: r.data.count || 0 }))).catch(() => { });
    api.get("/faculty").then(r => setStats(p => ({ ...p, faculty: r.data.count || 0 }))).catch(() => { });
    api.get("/attendance/faculty-records").then(r => setFacultyAttendance(r.data.data || [])).catch(() => { });
  }, []);

  const feeData = [
    { month: "Jan", collected: 45000 }, { month: "Feb", collected: 52000 },
    { month: "Mar", collected: 48000 }, { month: "Apr", collected: 61000 },
    { month: "May", collected: 55000 },
  ];
  const branchData = [
    { name: "CSE", value: 120 }, { name: "IT", value: 95 },
    { name: "ECE", value: 80 }, { name: "ME", value: 60 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.students || "0"} subtitle="+12 this month" icon={AcademicCapIcon} color="from-violet-500 to-purple-600" delay={0} />
        <StatCard title="Total Faculty" value={stats.faculty || "0"} subtitle="8 departments" icon={UsersIcon} color="from-blue-500 to-cyan-600" delay={0.1} />
        <StatCard title="Fees Collected" value="₹2.4L" subtitle="This semester" icon={BanknotesIcon} color="from-emerald-500 to-teal-600" delay={0.2} />
        <StatCard title="Active Notices" value="14" subtitle="3 urgent" icon={BellIcon} color="from-orange-500 to-amber-600" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Monthly Fee Collection (₹)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={feeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="collected" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
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
            {branchData.map((b, i) => (
              <div key={b.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {b.name}: {b.value}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Faculty Attendance Records */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Faculty Attendance Today</h3>
        {facultyAttendance.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No faculty attendance records found for today</p>
        ) : (
          <div className="space-y-2">
            {facultyAttendance.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p className="font-medium text-sm dark:text-white">{r.faculty?.name || "Faculty"}</p>
                  <p className="text-xs text-slate-400">{r.date}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✅ Present</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Admin Attendance Reports Page
function AdminAttendance() {
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [facultyAttendance, setFacultyAttendance] = useState([]);
  const [tab, setTab] = useState("student");

  useEffect(() => {
    api.get("/attendance/faculty-records").then(r => setFacultyAttendance(r.data.data || [])).catch(() => { });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Reports</h1>
      <div className="flex gap-2">
        <button onClick={() => setTab("student")} className={`px-4 py-2 rounded-xl font-semibold text-sm ${tab === "student" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white"}`}>
          👨‍🎓 Students
        </button>
        <button onClick={() => setTab("faculty")} className={`px-4 py-2 rounded-xl font-semibold text-sm ${tab === "faculty" ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white"}`}>
          👨‍🏫 Faculty
        </button>
      </div>

      <div className="card">
        {tab === "student" ? (
          <div>
            <h3 className="font-semibold dark:text-white mb-4">Student Attendance Records</h3>
            <p className="text-slate-400 text-sm text-center py-8">No student attendance records found</p>
          </div>
        ) : (
          <div>
            <h3 className="font-semibold dark:text-white mb-4">Faculty Attendance Records ({facultyAttendance.length})</h3>
            {facultyAttendance.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No faculty attendance records found</p>
            ) : (
              <div className="space-y-2">
                {facultyAttendance.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div>
                      <p className="font-medium text-sm dark:text-white">{r.faculty?.name || "Faculty"}</p>
                      <p className="text-xs text-slate-400">{r.faculty?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{r.date}</p>
                      <p className="text-xs text-green-600">⏰ {r.checkinTime ? new Date(r.checkinTime).toLocaleTimeString() : "N/A"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Marks Page
function AdminMarks() {
  const [students, setStudents] = useState([]);
  useEffect(() => {
    api.get("/students").then(r => setStudents(r.data.students || [])).catch(() => { });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marks Overview</h1>
      <div className="card">
        <h3 className="font-semibold dark:text-white mb-4">All Students ({students.length})</h3>
        {students.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No students found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  {["Name", "Roll No", "Branch", "Year", "Semester"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {students.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium dark:text-white">{s.user?.name}</td>
                    <td className="px-4 py-3 text-slate-500">{s.rollNo}</td>
                    <td className="px-4 py-3 text-slate-500">{s.branch}</td>
                    <td className="px-4 py-3 text-slate-500">{s.year}</td>
                    <td className="px-4 py-3 text-slate-500">{s.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Admin Reports Page
function AdminReports() {
  const [stats, setStats] = useState({ students: 0, faculty: 0 });
  useEffect(() => {
    api.get("/students").then(r => setStats(p => ({ ...p, students: r.data.count || 0 }))).catch(() => { });
    api.get("/faculty").then(r => setStats(p => ({ ...p, faculty: r.data.count || 0 }))).catch(() => { });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-4xl font-bold text-purple-600">{stats.students}</p>
          <p className="text-slate-500 mt-1">Total Students</p>
        </div>
        <div className="card text-center">
          <p className="text-4xl font-bold text-blue-600">{stats.faculty}</p>
          <p className="text-slate-500 mt-1">Total Faculty</p>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold dark:text-white mb-4">System Summary</h3>
        <div className="space-y-3">
          {[
            { label: "Total Students Enrolled", value: stats.students },
            { label: "Total Faculty Members", value: stats.faculty },
            { label: "Active Courses", value: "12" },
            { label: "Departments", value: "4" },
          ].map((item, i) => (
            <div key={i} className="flex justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
              <span className="font-bold text-purple-600">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="students/*" element={<ManageStudents />} />
        <Route path="faculty/*" element={<ManageFaculty />} />
        <Route path="fees/*" element={<ManageFees />} />
        <Route path="notices/*" element={<ManageNotices />} />
        <Route path="attendance/*" element={<AdminAttendance />} />
        <Route path="marks/*" element={<AdminMarks />} />
        <Route path="timetable/*" element={<ManageTimetable />} />
        <Route path="reports/*" element={<AdminReports />} />
        <Route path="*" element={<DashboardHome />} />
        <Route path="leaves/*" element={<LeaveManagement />} />
        <Route path="exams/*" element={<ExamManagement />} />
        <Route path="grievances/*" element={<GrievanceManagement />} />
        <Route path="timetable/*" element={<ManageTimetable />} />
        <Route path="registrations/*" element={<RegistrationRequests />} />
      </Routes>
    </Layout>
  );
}