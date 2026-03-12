import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import DarkModeToggle from "./DarkModeToggle";
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  BellIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  CheckCircleIcon,        // ← NEW: for Attendance Approvals
} from "@heroicons/react/24/outline";
import { useState } from "react";


const MENUS = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: HomeIcon },
    { label: "Students", path: "/admin/students", icon: AcademicCapIcon },
    { label: "Faculty", path: "/admin/faculty", icon: UsersIcon },
    { label: "Attendance", path: "/admin/attendance", icon: ClipboardDocumentListIcon },
    // ↓ NEW — Attendance Approvals (check-in / check-out requests)
    { label: "Attendance Approvals", path: "/admin/attendance-approvals", icon: CheckCircleIcon },
    { label: "Marks", path: "/admin/marks", icon: ChartBarIcon },
    { label: "Fees", path: "/admin/fees", icon: BanknotesIcon },
    { label: "Notices", path: "/admin/notices", icon: BellIcon },
    { label: "Timetable", path: "/admin/timetable", icon: CalendarIcon },
    { label: "Exams", path: "/admin/exams", icon: CalendarIcon },
    { label: "Leaves", path: "/admin/leaves", icon: CalendarIcon },
    { label: "Grievances", path: "/admin/grievances", icon: BellIcon },
    { label: "Registrations", path: "/admin/registrations", icon: ClipboardDocumentListIcon },
    { label: "Reports", path: "/admin/reports", icon: ChartBarIcon },
    { label: "ID Card", path: "/idcard", icon: UserCircleIcon },
    { label: "Settings", path: "/profile", icon: UserCircleIcon },
  ],
  faculty: [
    { label: "Dashboard", path: "/faculty/dashboard", icon: HomeIcon },
    { label: "Attendance", path: "/faculty/attendance", icon: ClipboardDocumentListIcon },
    { label: "Marks", path: "/faculty/marks", icon: ChartBarIcon },
    { label: "Timetable", path: "/faculty/timetable", icon: CalendarIcon },
    { label: "Assignments", path: "/faculty/assignments", icon: ClipboardDocumentListIcon },
    { label: "Notes", path: "/faculty/notes", icon: AcademicCapIcon },
    { label: "Notices", path: "/faculty/notices", icon: BellIcon },
    { label: "Leave", path: "/faculty/leaves", icon: CalendarIcon },
    { label: "Chat", path: "/faculty/chat", icon: ChatBubbleLeftRightIcon },
    { label: "ID Card", path: "/idcard", icon: UserCircleIcon },
    { label: "Settings", path: "/profile", icon: UserCircleIcon },
  ],
  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: HomeIcon },
    { label: "Attendance", path: "/student/attendance", icon: ClipboardDocumentListIcon },
    { label: "Marks", path: "/student/marks", icon: ChartBarIcon },
    { label: "Fees", path: "/student/fees", icon: BanknotesIcon },
    { label: "Timetable", path: "/student/timetable", icon: CalendarIcon },
    { label: "Assignments", path: "/student/assignments", icon: ClipboardDocumentListIcon },
    { label: "Study Material", path: "/student/study-material", icon: AcademicCapIcon },
    { label: "Exam Schedule", path: "/student/exam-schedule", icon: CalendarIcon },
    { label: "Result Card", path: "/student/result", icon: ChartBarIcon },
    { label: "Notices", path: "/student/notices", icon: BellIcon },
    { label: "Grievance", path: "/student/grievance", icon: BellIcon },
    { label: "AI Report", path: "/student/ai", icon: ChartBarIcon },
    { label: "Chat", path: "/student/chat", icon: ChatBubbleLeftRightIcon },
    { label: "ID Card", path: "/idcard", icon: UserCircleIcon },
    { label: "Settings", path: "/profile", icon: UserCircleIcon },
    { label: "RGPV Updates", path: "/student/rgpv-updates", icon: BellIcon },
  ],
};

const ROLE_CONFIG = {
  admin: { color: "from-violet-500 to-purple-600", bg: "#7c3aed", label: "Administrator" },
  faculty: { color: "from-blue-500 to-cyan-600", bg: "#2563eb", label: "Faculty" },
  student: { color: "from-emerald-500 to-teal-600", bg: "#059669", label: "Student" },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const menu = MENUS[user?.role] || [];
  const rc = ROLE_CONFIG[user?.role] || ROLE_CONFIG.admin;

  // ── Shared sidebar content (used in both desktop + mobile drawer) ──────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Profile header */}
      <div className={`bg-gradient-to-br ${rc.color} p-5 flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-white/30">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center
                                text-white font-bold text-lg">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400
                            rounded-full border-2 border-white" />
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate leading-tight">{user?.name}</p>
            <p className="text-white/60 text-xs mt-0.5">{rc.label}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
        {menu.map((item) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? `bg-gradient-to-r ${rc.color} text-white shadow-md`
                  : `text-slate-600 dark:text-slate-400
                     hover:bg-slate-100 dark:hover:bg-slate-700/60
                     hover:text-slate-800 dark:hover:text-white`
                }`}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-150
                  ${isActive ? "scale-110" : "group-hover:scale-105"}`}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer — dark mode toggle + logout */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <DarkModeToggle />
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex items-center gap-1.5 text-xs text-red-500
                       hover:text-white hover:bg-red-500 font-semibold
                       px-3 py-2 rounded-xl transition-all duration-150"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ──────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-16
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border-b border-slate-200/60 dark:border-slate-700/60
        flex items-center justify-between px-4 shadow-sm">

        {/* Hamburger */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setOpen(true)}
          className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${rc.color}
            flex items-center justify-center shadow-lg shadow-purple-500/20`}
        >
          <Bars3Icon className="w-5 h-5 text-white" />
        </motion.button>

        {/* Title */}
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${rc.color}
            flex items-center justify-center`}>
            <AcademicCapIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-sm">College ERP</span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-offset-1 ring-slate-200 dark:ring-slate-600">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${rc.color}
              flex items-center justify-center text-white font-bold text-sm`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-72
                bg-white dark:bg-slate-800 z-50 shadow-2xl shadow-black/30
                flex flex-col overflow-hidden"
            >
              {/* Close button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8
                  bg-slate-100 dark:bg-slate-700 rounded-xl
                  flex items-center justify-center"
              >
                <XMarkIcon className="w-4 h-4 text-slate-500 dark:text-white" />
              </motion.button>

              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-col w-64 h-screen
        bg-white dark:bg-slate-800
        border-r border-slate-100 dark:border-slate-700
        shadow-sm fixed left-0 top-0 z-30">
        <SidebarContent />
      </div>
    </>
  );
}