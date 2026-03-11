import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { AcademicCapIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const ROLES = [
  { label: "Student", value: "student", color: "from-emerald-500 to-teal-600" },
  { label: "Faculty", value: "faculty", color: "from-blue-500 to-cyan-600" },
];

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "",
    // student
    rollNo: "", branch: "CSE", semester: "1", year: "1", section: "A",
    // faculty
    department: "CSE", designation: "Lecturer",
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error("Fill all required fields"); return; }
    setSubmitting(true);
    try {
      await api.post("/registrations", { ...form, role });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setSubmitting(false); }
  };

  const activeRole = ROLES.find(r => r.value === role);

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center max-w-md w-full">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
        <p className="text-white/60 mb-6">Admin will review your request. You'll be able to login once approved.</p>
        <button onClick={() => navigate("/login")} className="btn-primary w-full">Back to Login</button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}>

      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg z-10">
        <div className="absolute -inset-0.5 rounded-3xl blur-sm opacity-40"
          style={{ background: `linear-gradient(135deg, #7c3aed, #2563eb)` }} />

        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
              <AcademicCapIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Register Account</h1>
            <p className="text-white/50 text-sm mt-1">Admin will approve your request</p>
          </div>

          {/* Role tabs */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
            {ROLES.map(r => (
              <button key={r.value} onClick={() => setRole(r.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition relative overflow-hidden ${role === r.value ? "text-white" : "text-white/40"}`}>
                {role === r.value && (
                  <motion.div layoutId="regTab" className={`absolute inset-0 bg-gradient-to-r ${r.color}`}
                    transition={{ type: "spring", damping: 20 }} />
                )}
                <span className="relative z-10">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Common fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <input type="text" placeholder="Full Name *" value={form.name} onChange={e => set("name", e.target.value)}
                  required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
              </div>
              <div className="col-span-2">
                <input type="email" placeholder="Email *" value={form.email} onChange={e => set("email", e.target.value)}
                  required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
              </div>
              <div className="relative col-span-2">
                <input type={showPass ? "text" : "password"} placeholder="Password *" value={form.password} onChange={e => set("password", e.target.value)}
                  required className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-400" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                  {showPass ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
              <div className="col-span-2">
                <input type="text" placeholder="Phone Number" value={form.phone} onChange={e => set("phone", e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
              </div>
            </div>

            {/* Role-specific fields */}
            <AnimatePresence mode="wait">
              {role === "student" ? (
                <motion.div key="student" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Roll No" value={form.rollNo} onChange={e => set("rollNo", e.target.value)}
                    className="bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
                  <select value={form.branch} onChange={e => set("branch", e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {["CSE","IT","ECE","EE","ME","CE"].map(b => <option key={b} className="text-black">{b}</option>)}
                  </select>
                  <select value={form.year} onChange={e => set("year", e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {[1,2,3,4].map(y => <option key={y} value={y} className="text-black">Year {y}</option>)}
                  </select>
                  <select value={form.semester} onChange={e => set("semester", e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="text-black">Sem {s}</option>)}
                  </select>
                </motion.div>
              ) : (
                <motion.div key="faculty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-2 gap-3">
                  <select value={form.department} onChange={e => set("department", e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {["CSE","IT","ECE","EE","ME","CE","Mathematics","Physics"].map(d => <option key={d} className="text-black">{d}</option>)}
                  </select>
                  <select value={form.designation} onChange={e => set("designation", e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {["Lecturer","Assistant Professor","Associate Professor","Professor","HOD"].map(d => <option key={d} className="text-black">{d}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={submitting} whileTap={{ scale: 0.97 }}
              className={`w-full bg-gradient-to-r ${activeRole.color} text-white font-semibold py-3 rounded-xl mt-2`}>
              {submitting ? "Submitting..." : "Submit Registration Request"}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-xs mt-4">
            Already have account?{" "}
            <button onClick={() => navigate("/login")} className="text-purple-300 hover:underline">Login</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}