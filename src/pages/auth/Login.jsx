import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { AcademicCapIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const ROLES = [
  { label: "Admin",   value: "admin",   color: "from-violet-500 to-purple-600", icon: "🛡️" },
  { label: "Faculty", value: "faculty", color: "from-blue-500 to-cyan-600",     icon: "👨‍🏫" },
  { label: "Student", value: "student", color: "from-emerald-500 to-teal-600",  icon: "🎓" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", id: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <motion.div key={i} className="absolute rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ width: `${200+i*80}px`, height: `${200+i*80}px`, background: i%2===0?"#7c3aed":"#2563eb", top:`${10+i*18}%`, left:`${5+i*20}%` }}
          animate={{ x:[0,30,0], y:[0,-20,0] }} transition={{ duration: 6+i, repeat: Infinity, ease:"easeInOut" }} />
      ))}
      <motion.div initial={{ opacity:0, y:40, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
        transition={{ duration:0.6 }} className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <motion.div whileHover={{ rotate:360 }} transition={{ duration:0.8 }}
              className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">College ERP</h1>
            <p className="text-white/50 text-sm mt-1">Sign in to your account</p>
          </div>
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl">
            {ROLES.map(r => (
              <motion.button key={r.value} whileTap={{ scale:0.95 }} onClick={() => setActiveRole(r.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${activeRole===r.value ? `bg-gradient-to-r ${r.color} text-white shadow-lg` : "text-white/50 hover:text-white"}`}>
                <span className="mr-1">{r.icon}</span>{r.label}
              </motion.button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">Email Address</label>
              <input name="email" type="email" placeholder="you@college.edu" value={form.email}
                onChange={e => setForm(p=>({...p, email:e.target.value}))}
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition" />
            </div>
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">Password</label>
              <div className="relative">
                <input name="password" type={showPass?"text":"password"} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p=>({...p, password:e.target.value}))}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition" />
                <button type="button" onClick={() => setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition">
                  {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="text-right">
              <button type="button" onClick={() => navigate("/forgot-password")} className="text-purple-300 text-xs hover:text-purple-200 transition">
                Forgot password?
              </button>
            </div>
            <motion.button type="submit" whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-60">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="l" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <motion.span key="t" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-2">
                    Sign In <ArrowRightIcon className="w-4 h-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
          <p className="text-center text-white/30 text-xs mt-6">© 2026 College ERP System</p>
        </div>
      </motion.div>
    </div>
  );
}
