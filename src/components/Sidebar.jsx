import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "./DarkModeToggle";
import {
  HomeIcon, UsersIcon, AcademicCapIcon, ClipboardDocumentListIcon,
  BanknotesIcon, BellIcon, CalendarIcon, ChatBubbleLeftRightIcon,
  ChartBarIcon, ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

const MENUS = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
    { label: "Students", path: "/admin/students", icon: AcademicCapIcon },
    { label: "Faculty", path: "/admin/faculty", icon: UsersIcon },
    { label: "Attendance", path: "/admin/attendance", icon: ClipboardDocumentListIcon },
    { label: "Marks", path: "/admin/marks", icon: ChartBarIcon },
    { label: "Fees", path: "/admin/fees", icon: BanknotesIcon },
    { label: "Notices", path: "/admin/notices", icon: BellIcon },
    { label: "Timetable", path: "/admin/timetable", icon: CalendarIcon },
    { label: "Reports", path: "/admin/reports", icon: ChartBarIcon },
  ],
  faculty: [
    { label: "Dashboard", path: "/faculty/dashboard", icon: HomeIcon },
    { label: "Attendance", path: "/faculty/attendance", icon: ClipboardDocumentListIcon },
    { label: "Marks", path: "/faculty/marks", icon: ChartBarIcon },
    { label: "Timetable", path: "/faculty/timetable", icon: CalendarIcon },
    { label: "Notices", path: "/faculty/notices", icon: BellIcon },
    { label: "Chat", path: "/faculty/chat", icon: ChatBubbleLeftRightIcon },
  ],
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: HomeIcon },
    { label: "Attendance", path: "/student/attendance", icon: ClipboardDocumentListIcon },
    { label: "Marks", path: "/student/marks", icon: ChartBarIcon },
    { label: "Fees", path: "/student/fees", icon: BanknotesIcon },
    { label: "Timetable", path: "/student/timetable", icon: CalendarIcon },
    { label: "Notices", path: "/student/notices", icon: BellIcon },
    { label: "AI Report", path: "/student/ai", icon: ChartBarIcon },
    { label: "Chat", path: "/student/chat", icon: ChatBubbleLeftRightIcon },
  ],
};

const ROLE_COLORS = {
  admin: "from-violet-500 to-purple-600",
  faculty: "from-blue-500 to-cyan-600",
  student: "from-emerald-500 to-teal-600",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menu = MENUS[user?.role] || [];
  const color = ROLE_COLORS[user?.role] || "from-violet-500 to-purple-600";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`p-4 bg-gradient-to-r ${color}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
            <p className="text-white/70 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map(item => (
          <NavLink key={item.path} to={item.path} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? `bg-gradient-to-r ${color} text-white shadow-lg`
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <DarkModeToggle />
        <button onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition">
          <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <Bars3Icon className="w-5 h-5 text-slate-700 dark:text-white" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)} className="lg:hidden fixed inset-0 bg-black/50 z-40" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 z-50 shadow-2xl">
              <button onClick={() => setOpen(false)} className="absolute top-3 right-3 p-1 text-slate-500">
                <XMarkIcon className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col w-64 h-screen bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 shadow-sm fixed left-0 top-0">
        <SidebarContent />
      </div>
    </>
  );
}
