import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const ROLES = [
  { label: "Admin", value: "admin", color: "from-violet-500 to-purple-600", bg: "#7c3aed", icon: "🛡️" },
  { label: "Faculty", value: "faculty", color: "from-blue-500 to-cyan-600", bg: "#2563eb", icon: "👨‍🏫" },
  { label: "Student", value: "student", color: "from-emerald-500 to-teal-600", bg: "#059669", icon: "🎓" },
];

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 4,
}));

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeRole, setActiveRole] = useState("student");
  const [focusedField, setFocusedField] = useState(null);
  const activeRoleData = ROLES.find(r => r.value === activeRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate(`/${user.role}/dashboard`), 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      {/* Animated gradient bg blobs */}
      {ROLES.map((r, i) => (
        <motion.div key={r.value} className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: 350, height: 350, background: r.bg, opacity: activeRole === r.value ? 0.15 : 0.04,
            top: `${15 + i * 25}%`, left: `${10 + i * 25}%`
          }}
          animate={{ scale: activeRole === r.value ? [1, 1.2, 1] : 1, opacity: activeRole === r.value ? 0.15 : 0.04 }}
          transition={{ duration: 2, repeat: activeRole === r.value ? Infinity : 0, ease: "easeInOut" }} />
      ))}

      {/* Floating particles */}
      {PARTICLES.map(p => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`,
            background: activeRoleData?.bg, opacity: 0.4
          }}
          animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />

      <AnimatePresence mode="wait">
        {success ? (
          /* Success Screen */
          <motion.div key="success" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }} className="flex flex-col items-center gap-4 z-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.6 }}
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }}>
              ✅
            </motion.div>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-white text-xl font-bold">Welcome back!</motion.p>
            <motion.div initial={{ width: 0 }} animate={{ width: 200 }} transition={{ delay: 0.4, duration: 0.8 }}
              className="h-1 rounded-full" style={{ background: activeRoleData?.bg }} />
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-white/50 text-sm">Redirecting to dashboard...</motion.p>
          </motion.div>
        ) : (
          /* Login Card */
          <motion.div key="login" initial={{ opacity: 0, y: 60, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -60, scale: 0.9 }} transition={{ duration: 0.7, type: "spring", damping: 20 }}
            className="relative w-full max-w-md z-10">

            {/* Glow border effect */}
            <motion.div className="absolute -inset-0.5 rounded-3xl blur opacity-50"
              style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }}
              animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />

            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.8 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }}>
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </motion.div>
                <motion.h1 key={activeRole} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold text-white">College ERP</motion.h1>
                <motion.p key={activeRole + "sub"} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-white/50 text-sm mt-1">{activeRoleData?.icon} Sign in as {activeRoleData?.label}</motion.p>
              </div>

              {/* Role Tabs */}
              <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl">
                {ROLES.map(r => (
                  <motion.button key={r.value} whileTap={{ scale: 0.92 }} onClick={() => setActiveRole(r.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 relative overflow-hidden ${activeRole === r.value ? "text-white shadow-lg" : "text-white/40 hover:text-white/70"}`}>
                    {activeRole === r.value && (
                      <motion.div layoutId="roleTab" className={`absolute inset-0 bg-gradient-to-r ${r.color} rounded-xl`}
                        transition={{ type: "spring", damping: 20 }} />
                    )}
                    <span className="relative z-10">{r.icon} {r.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <motion.div animate={{ scale: focusedField === "email" ? 1.01 : 1 }} transition={{ duration: 0.2 }}>
                  <label className="text-white/70 text-xs font-medium mb-1 block">Email Address</label>
                  <div className="relative">
                    <input name="email" type="email" placeholder="you@college.edu" value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition" />
                    {focusedField === "email" && (
                      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: activeRoleData?.bg }} />
                    )}
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div animate={{ scale: focusedField === "password" ? 1.01 : 1 }} transition={{ duration: 0.2 }}>
                  <label className="text-white/70 text-xs font-medium mb-1 block">Password</label>
                  <div className="relative">
                    <input name="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition" />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                      {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                    {focusedField === "password" && (
                      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                        style={{ background: activeRoleData?.bg }} />
                    )}
                  </div>
                </motion.div>

                <div className="text-right">
                  <button type="button" onClick={() => navigate("/forgot-password")}
                    className="text-purple-300 text-xs hover:text-purple-200 transition">
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <motion.button type="submit" whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${activeRoleData?.bg}60` }}
                  whileTap={{ scale: 0.97 }} disabled={loading}
                  className={`w-full bg-gradient-to-r ${activeRoleData?.color} text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 relative overflow-hidden`}>
                  <motion.div className="absolute inset-0 bg-white/20"
                    initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </motion.div>
                    ) : (
                      <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 relative z-10">
                        Sign In <ArrowRightIcon className="w-4 h-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              <p className="text-center text-white/20 text-xs mt-6">© 2026 College ERP System</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}