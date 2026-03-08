import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const ROLES = [
  { label: "Admin", value: "admin", color: "from-violet-500 to-purple-600", bg: "#7c3aed", light: "#a78bfa" },
  { label: "Faculty", value: "faculty", color: "from-blue-500 to-cyan-600", bg: "#2563eb", light: "#60a5fa" },
  { label: "Student", value: "student", color: "from-emerald-500 to-teal-600", bg: "#059669", light: "#34d399" },
];

const ICONS = { admin: "🛡️", faculty: "👨‍🏫", student: "🎓" };

// Reduced particles — sirf 15
const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 3 + 1, duration: Math.random() * 6 + 4, delay: Math.random() * 4,
}));

// Confetti — sirf 30
const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  id: i, x: Math.random() * 100,
  color: ["#7c3aed", "#2563eb", "#059669", "#f59e0b", "#ef4444", "#ec4899"][i % 6],
  size: Math.random() * 8 + 4, duration: Math.random() * 2 + 1, delay: Math.random() * 0.5,
  rotation: Math.random() * 360,
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
  const [emailValid, setEmailValid] = useState(false);
  const [ripple, setRipple] = useState(null);

  const activeRoleData = ROLES.find(r => r.value === activeRole);

  const handleEmailChange = (e) => {
    setForm(p => ({ ...p, email: e.target.value }));
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value));
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - btn.left, y: e.clientY - btn.top });
    setTimeout(() => setRipple(null), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate(`/${user.role}/dashboard`), 1800);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      {/* Static grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Reduced floating particles */}
      {PARTICLES.map(p => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, background: activeRoleData?.light, opacity: 0.3 }}
          animate={{ y: [-15, 15, -15], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Single blob per role — only active one animates */}
      <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: 350, height: 350, background: activeRoleData?.bg, top: "20%", left: "10%", opacity: 0.12 }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute rounded-full blur-3xl pointer-events-none"
        style={{ width: 250, height: 250, background: activeRoleData?.light, bottom: "10%", right: "5%", opacity: 0.08 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} />

      <AnimatePresence mode="wait">
        {success ? (
          /* SUCCESS SCREEN */
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.9)" }}>

            {/* Confetti */}
            {CONFETTI.map(c => (
              <motion.div key={c.id} className="absolute rounded-sm pointer-events-none"
                style={{ width: c.size, height: c.size / 2, background: c.color, left: `${c.x}%`, top: "-5%" }}
                animate={{ y: ["0vh", "110vh"], rotate: [0, c.rotation * 2], opacity: [1, 0] }}
                transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }} />
            ))}

            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, delay: 0.1 }}
              className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-2xl mb-5 relative z-10"
              style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }}>
              ✅
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }} className="text-white text-2xl font-bold mb-2 relative z-10">
              Welcome! {ICONS[activeRole]}
            </motion.h2>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="text-white/50 text-sm mb-6 relative z-10">Redirecting to dashboard...</motion.p>

            <motion.div initial={{ width: 0 }} animate={{ width: 220 }}
              transition={{ delay: 0.5, duration: 1.1, ease: "easeInOut" }}
              className="h-1.5 rounded-full relative z-10"
              style={{ background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})` }} />
          </motion.div>

        ) : (
          /* LOGIN CARD */
          <motion.div key="login"
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.92 }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
            className="relative w-full max-w-md z-10">

            {/* Glow border — static, no animation */}
            <div className="absolute -inset-0.5 rounded-3xl blur-sm opacity-40"
              style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }} />

            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">

              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <motion.div whileHover={{ rotate: 360 }} whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }}>
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.h1 key={activeRole + "t"} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}
                    className="text-2xl font-bold text-white">College ERP</motion.h1>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p key={activeRole + "s"} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}
                    className="text-white/50 text-sm mt-1">
                    {ICONS[activeRole]} Sign in as {activeRoleData?.label}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Role Tabs */}
              <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
                {ROLES.map(r => (
                  <motion.button key={r.value} whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveRole(r.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 relative overflow-hidden ${activeRole === r.value ? "text-white" : "text-white/40 hover:text-white/70"}`}>
                    {activeRole === r.value && (
                      <motion.div layoutId="roleTab" className={`absolute inset-0 bg-gradient-to-r ${r.color}`}
                        transition={{ type: "spring", damping: 20, stiffness: 250 }} />
                    )}
                    <span className="relative z-10">{r.icon} {r.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-1 block">Email Address</label>
                  <div className="relative">
                    <input type="email" placeholder="you@college.edu" value={form.email}
                      onChange={handleEmailChange}
                      onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-purple-400 transition" />
                    <AnimatePresence>
                      {emailValid && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {focusedField === "email" && (
                      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                        style={{ background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})` }} />
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-white/70 text-xs font-medium mb-1 block">Password</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} placeholder="••••••••" value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                      className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-purple-400 transition" />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition">
                      {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                    {focusedField === "password" && (
                      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                        style={{ background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})` }} />
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <button type="button" onClick={() => navigate("/forgot-password")}
                    className="text-purple-300 text-xs hover:text-purple-200 transition">Forgot password?</button>
                </div>

                {/* Submit */}
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleRipple}
                  className={`w-full bg-gradient-to-r ${activeRoleData?.color} text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 relative overflow-hidden`}>

                  {/* Ripple */}
                  <AnimatePresence>
                    {ripple && (
                      <motion.div className="absolute rounded-full bg-white/30 pointer-events-none"
                        style={{ width: 10, height: 10, left: ripple.x - 5, top: ripple.y - 5 }}
                        initial={{ scale: 0, opacity: 1 }} animate={{ scale: 25, opacity: 0 }}
                        transition={{ duration: 0.5 }} />
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.5, delay: i * 0.12, repeat: Infinity }} />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        🚀 Sign In <ArrowRightIcon className="w-4 h-4" />
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