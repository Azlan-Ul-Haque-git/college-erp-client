import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  AcademicCapIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const ROLES = [
  {
    label: "Admin",
    value: "admin",
    color: "from-violet-500 to-purple-600",
    bg: "#7c3aed",
    light: "#a78bfa",
  },
  {
    label: "Faculty",
    value: "faculty",
    color: "from-blue-500 to-cyan-600",
    bg: "#2563eb",
    light: "#60a5fa",
  },
  {
    label: "Student",
    value: "student",
    color: "from-emerald-500 to-teal-600",
    bg: "#059669",
    light: "#34d399",
  },
];

const ICONS = {
  admin: "🛡️",
  faculty: "👨‍🏫",
  student: "🎓",
};

const PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 6 + 4,
  delay: Math.random() * 4,
}));

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState("student");
  const [focusedField, setFocusedField] = useState(null);
  const [emailValid, setEmailValid] = useState(false);

  const activeRoleData = ROLES.find(
    (r) => r.value === activeRole
  );

  const handleEmailChange = (e) => {
    setForm((p) => ({
      ...p,
      email: e.target.value,
    }));

    setEmailValid(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      console.log("LOGIN START");

      const user = await login(
        form.email,
        form.password
      );

      console.log("LOGIN SUCCESS =>", user);

      toast.success("Login successful");

      navigate(`/${user.role}/dashboard`);

    } catch (err) {
      console.log(
        "LOGIN ERROR =>",
        err.response?.data || err
      );

      toast.error(
        err.response?.data?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative"
      style={{
        background:
          "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: activeRoleData?.light,
            opacity: 0.3,
          }}
          animate={{
            y: [-15, 15, -15],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Glow blobs */}
      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: 350,
          height: 350,
          background: activeRoleData?.bg,
          top: "20%",
          left: "10%",
          opacity: 0.12,
        }}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute rounded-full blur-3xl pointer-events-none"
        style={{
          width: 250,
          height: 250,
          background: activeRoleData?.light,
          bottom: "10%",
          right: "5%",
          opacity: 0.08,
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Login Card */}
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.6,
          type: "spring",
          damping: 20,
        }}
        className="relative w-full max-w-md z-10"
      >
        {/* Border glow */}
        <div
          className="absolute -inset-0.5 rounded-3xl blur-sm opacity-40"
          style={{
            background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)`,
          }}
        />

        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              whileHover={{ rotate: 360 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg cursor-pointer"
              style={{
                background: `linear-gradient(135deg, ${activeRoleData?.bg}, #7c3aed)`,
              }}
            >
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white">
              College ERP
            </h1>

            <p className="text-white/50 text-sm mt-1">
              {ICONS[activeRole]} Sign in as{" "}
              {activeRoleData?.label}
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/10">
            {ROLES.map((r) => (
              <motion.button
                key={r.value}
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveRole(r.value)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 relative overflow-hidden ${activeRole === r.value
                  ? "text-white"
                  : "text-white/40 hover:text-white/70"
                  }`}
              >
                {activeRole === r.value && (
                  <motion.div
                    layoutId="roleTab"
                    className={`absolute inset-0 bg-gradient-to-r ${r.color}`}
                  />
                )}

                <span className="relative z-10">
                  {r.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            {/* Email */}
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">
                Email Address
              </label>

              <div className="relative">
                <input
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={handleEmailChange}
                  onFocus={() =>
                    setFocusedField("email")
                  }
                  onBlur={() =>
                    setFocusedField(null)
                  }
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-purple-400 transition"
                />

                <AnimatePresence>
                  {emailValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {focusedField === "email" && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                    style={{
                      background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-white/70 text-xs font-medium mb-1 block">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      password: e.target.value,
                    }))
                  }
                  onFocus={() =>
                    setFocusedField("password")
                  }
                  onBlur={() =>
                    setFocusedField(null)
                  }
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-purple-400 transition"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPass((p) => !p)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                >
                  {showPass ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>

                {focusedField === "password" && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full origin-left"
                    style={{
                      background: `linear-gradient(90deg, ${activeRoleData?.bg}, ${activeRoleData?.light})`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Links */}
            <div className="text-right">
              <button
                type="button"
                onClick={() =>
                  navigate("/forgot-password")
                }
                className="text-purple-300 text-xs hover:text-purple-200 transition"
              >
                Forgot password?
              </button>

              <p className="text-center text-white/40 text-xs mt-2">
                New user?{" "}
                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
                  className="text-purple-300 hover:text-purple-200 transition"
                >
                  Register here
                </button>
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-all"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-6">
            © 2026 College ERP System
          </p>
        </div>
      </motion.div>
    </div>
  );
}