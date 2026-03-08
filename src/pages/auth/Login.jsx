import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const ROLES = [
  { label: "Admin", value: "admin", color: "from-violet-500 to-purple-600", bg: "#7c3aed", light: "#a78bfa" },
  { label: "Faculty", value: "faculty", color: "from-blue-500 to-cyan-600", bg: "#2563eb", light: "#60a5fa" },
  { label: "Student", value: "student", color: "from-emerald-500 to-teal-600", bg: "#059669", light: "#34d399" },
];

const ICONS = { admin: "🛡️", faculty: "👨‍🏫", student: "🎓" };

// Stars
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 3 + 1, duration: Math.random() * 4 + 2, delay: Math.random() * 5,
}));

// Streaks
const STREAKS = Array.from({ length: 8 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  angle: Math.random() * 360, duration: Math.random() * 3 + 2, delay: Math.random() * 6,
}));

// Confetti
const CONFETTI = Array.from({ length: 60 }, (_, i) => ({
  id: i, x: Math.random() * 100, color: ["#7c3aed", "#2563eb", "#059669", "#f59e0b", "#ef4444", "#ec4899"][i % 6],
  size: Math.random() * 10 + 5, duration: Math.random() * 2 + 1, delay: Math.random() * 0.5,
  rotation: Math.random() * 360,
}));

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeRole, setActiveRole] = useState("student");
  const [focusedField, setFocusedField] = useState(null);
  const [emailValid, setEmailValid] = useState(false);
  const [ripple, setRipple] = useState(null);
  const [bgShift, setBgShift] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);
  const springRotateX = useSpring(rotateX, { stiffness: 100, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 100, damping: 20 });

  const activeRoleData = ROLES.find(r => r.value === activeRole);

  useEffect(() => {
    const interval = setInterval(() => setBgShift(p => (p + 1) % 360), 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const handleEmailChange = (e) => {
    setForm(p => ({ ...p, email: e.target.value }));
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value));
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - btn.left, y: e.clientY - btn.top });
    setTimeout(() => setRipple(null), 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      setSuccess(true);
      setTimeout(() => navigate(`/${user.role}/dashboard`), 2200);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{ background: `linear-gradient(${bgShift}deg, #0f0c29, #302b63, #24243e, #0f0c29)` }}>

      {/* Starfield */}
      {STARS.map(s => (
        <motion.div key={s.id} className="absolute rounded-full pointer-events-none"
          style={{ width: s.size, height: s.size, left: `${s.x}%`, top: `${s.y}%`, background: "#fff" }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Lightning streaks */}
      {STREAKS.map(s => (
        <motion.div key={s.id} className="absolute pointer-events-none rounded-full"
          style={{
            width: 2, height: Math.random() * 80 + 40, left: `${s.x}%`, top: `${s.y}%`,
            background: `linear-gradient(180deg, transparent, ${activeRoleData?.light}, transparent)`,
            transform: `rotate(${s.angle}deg)`, opacity: 0
          }}
          animate={{ opacity: [0, 0.8, 0], scaleY: [0, 1, 0] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, repeatDelay: Math.random() * 4 + 2 }} />
      ))}

      {/* Mesh gradient blobs */}
      {ROLES.map((r, i) => (
        <motion.div key={r.value} className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: 400, height: 400, background: r.bg,
            top: `${i * 30}%`, left: `${i * 30}%`
          }}
          animate={{ opacity: activeRole === r.value ? [0.12, 0.2, 0.12] : 0.03, scale: activeRole === r.value ? [1, 1.1, 1] : 0.8 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

      <AnimatePresence mode="wait">
        {success ? (
          /* ── SUCCESS SCREEN ── */
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center z-50"
            style={{ background: "rgba(0,0,0,0.85)" }}>

            {/* Confetti */}
            {CONFETTI.map(c => (
              <motion.div key={c.id} className="absolute rounded-sm pointer-events-none"
                style={{ width: c.size, height: c.size / 2, background: c.color, left: `${c.x}%`, top: "-5%" }}
                animate={{ y: ["0vh", "110vh"], rotate: [0, c.rotation * 3], opacity: [1, 0] }}
                transition={{ duration: c.duration, delay: c.delay, ease: "easeIn" }} />
            ))}

            {/* Flash */}
            <motion.div className="absolute inset-0" style={{ background: activeRoleData?.bg }}
              initial={{ opacity: 0.8 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }} />

            {/* Star burst */}
            {[...Array(12)].map((_, i) => (
              <motion.div key={i} className="absolute w-1 rounded-full"
                style={{
                  background: activeRoleData?.light, height: 60, transformOrigin: "bottom center",
                  rotate: i * 30, top: "calc(50% - 60px)", left: "50%"
                }}
                initial={{ scaleY: 0, opacity: 1 }}
                animate={{ scaleY: [0, 1.5, 0], opacity: [1, 0.8, 0] }}
                transition={{ duration: 0.8, delay: 0.1 + i * 0.02 }} />
            ))}

            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-2xl mb-6 relative z-10"
              style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }}>
              ✅
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }} className="text-white text-3xl font-bold mb-2 relative z-10">
              Welcome! {ICONS[activeRole]}
            </motion.h2>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="text-white/50 text-sm mb-6 relative z-10">Redirecting to dashboard...</motion.p>

            <motion.div initial={{ width: 0 }} animate={{ width: 250 }}
              transition={{ delay: 0.7, duration: 1.3, ease: "easeInOut" }}
              className="h-1.5 rounded-full relative z-10"
              style={{ background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})` }} />
          </motion.div>

        ) : (
          /* ── LOGIN CARD ── */
          <motion.div key="login" ref={cardRef}
            initial={{ opacity: 0, y: 80, scale: 0.85, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: -80, scale: 0.85, rotateX: -20 }}
            transition={{ duration: 0.8, type: "spring", damping: 18 }}
            style={{ rotateX: springRotateX, rotateY: springRotateY, perspective: 1000, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-md z-10">

            {/* Animated glow border */}
            <motion.div className="absolute -inset-1 rounded-3xl blur-md"
              style={{ background: `linear-gradient(${bgShift}deg, ${activeRoleData?.bg}, #7c3aed, ${activeRoleData?.light})` }}
              animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 2, repeat: Infinity }} />

            {/* Holographic shine */}
            <motion.div className="absolute inset-0 rounded-3xl pointer-events-none z-20 overflow-hidden">
              <motion.div className="absolute inset-0 opacity-10"
                style={{ background: `linear-gradient(${bgShift * 2}deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)` }} />
            </motion.div>

            <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">

              {/* Inner sparkles */}
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-white pointer-events-none"
                  style={{ left: `${20 + i * 15}%`, top: `${10 + i * 5}%` }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} />
              ))}

              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <motion.div whileHover={{ rotate: 360, scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg cursor-pointer relative"
                  style={{ background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)` }}>
                  <AcademicCapIcon className="w-8 h-8 text-white" />
                  <motion.div className="absolute inset-0 rounded-2xl"
                    animate={{ boxShadow: [`0 0 0px ${activeRoleData?.bg}`, `0 0 25px ${activeRoleData?.bg}`, `0 0 0px ${activeRoleData?.bg}`] }}
                    transition={{ duration: 2, repeat: Infinity }} />
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.h1 key={activeRole + "title"} initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }} className="text-2xl font-bold text-white">College ERP</motion.h1>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.p key={activeRole + "sub"} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }} className="text-white/50 text-sm mt-1">
                    {ICONS[activeRole]} Sign in as {activeRoleData?.label}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Role Tabs */}
              <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
                {ROLES.map(r => (
                  <motion.button key={r.value} whileTap={{ scale: 0.88 }} onClick={() => setActiveRole(r.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 relative overflow-hidden ${activeRole === r.value ? "text-white" : "text-white/40 hover:text-white/70"}`}>
                    {activeRole === r.value && (
                      <motion.div layoutId="roleTab" className={`absolute inset-0 bg-gradient-to-r ${r.color}`}
                        transition={{ type: "spring", damping: 18, stiffness: 200 }} />
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
                        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2">
                          <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {focusedField === "email" && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                          style={{ background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})` }} />
                      )}
                    </AnimatePresence>
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
                      <AnimatePresence mode="wait">
                        {showPass
                          ? <motion.div key="hide" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><EyeSlashIcon className="w-5 h-5" /></motion.div>
                          : <motion.div key="show" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><EyeIcon className="w-5 h-5" /></motion.div>
                        }
                      </AnimatePresence>
                    </button>
                    <AnimatePresence>
                      {focusedField === "password" && (
                        <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                          className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                          style={{ background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})` }} />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="text-right">
                  <button type="button" onClick={() => navigate("/forgot-password")}
                    className="text-purple-300 text-xs hover:text-purple-200 transition">Forgot password?</button>
                </div>

                {/* Submit Button */}
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${activeRoleData?.bg}80` }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleRipple}
                  className={`w-full bg-gradient-to-r ${activeRoleData?.color} text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 relative overflow-hidden`}>

                  {/* Ripple */}
                  <AnimatePresence>
                    {ripple && (
                      <motion.div className="absolute rounded-full bg-white/30 pointer-events-none"
                        style={{ width: 10, height: 10, left: ripple.x - 5, top: ripple.y - 5 }}
                        initial={{ scale: 0, opacity: 1 }} animate={{ scale: 30, opacity: 0 }}
                        exit={{ opacity: 0 }} transition={{ duration: 0.6 }} />
                    )}
                  </AnimatePresence>

                  {/* Shimmer */}
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />

                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 relative z-10">
                        {/* Wave dots */}
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                            animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                        ))}
                      </motion.div>
                    ) : (
                      <motion.span key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 relative z-10">
                        🚀 Sign In <ArrowRightIcon className="w-4 h-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>

              <p className="text-center text-white/20 text-xs mt-6">© 2026 College ERP System
              <br />All rights reserved.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}