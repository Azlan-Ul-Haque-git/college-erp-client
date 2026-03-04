import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pass, setPass] = useState({ new:"", confirm:"" });
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    if (!email) return toast.error("Enter your email");
    setLoading(true);
    try { await api.post("/auth/forgot-password", { email }); toast.success("OTP sent!"); setStep("otp"); }
    catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setLoading(false); }
  };

  const resetPass = async () => {
    if (pass.new !== pass.confirm) return toast.error("Passwords don't match");
    if (pass.new.length < 6) return toast.error("Min 6 chars");
    setLoading(true);
    try { await api.post("/auth/reset-password", { email, otp, newPassword: pass.new }); toast.success("Password reset!"); setStep("done"); }
    catch (e) { toast.error(e.response?.data?.message || "Reset failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-sm">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <button onClick={() => navigate("/login")} className="text-white/50 hover:text-white flex items-center gap-1 text-sm mb-6 transition">
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </button>
          <AnimatePresence mode="wait">
            {step==="email" && (
              <motion.div key="e" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 className="text-xl font-bold text-white mb-1">Forgot Password</h2>
                <p className="text-white/50 text-sm mb-6">Enter your registered email</p>
                <input type="email" placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 mb-4" />
                <button onClick={sendOTP} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60">
                  {loading?"Sending...":"Send OTP"}
                </button>
              </motion.div>
            )}
            {step==="otp" && (
              <motion.div key="o" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 className="text-xl font-bold text-white mb-6">Enter OTP</h2>
                <input type="text" maxLength={6} placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-center tracking-widest text-xl focus:outline-none focus:border-purple-400 mb-4" />
                <button onClick={() => setStep("newpass")} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold py-3 rounded-xl">
                  Verify OTP
                </button>
              </motion.div>
            )}
            {step==="newpass" && (
              <motion.div key="n" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
                <h2 className="text-xl font-bold text-white mb-6">New Password</h2>
                <input type="password" placeholder="New password" value={pass.new} onChange={e=>setPass(p=>({...p,new:e.target.value}))}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 mb-3" />
                <input type="password" placeholder="Confirm password" value={pass.confirm} onChange={e=>setPass(p=>({...p,confirm:e.target.value}))}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 mb-4" />
                <button onClick={resetPass} disabled={loading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60">
                  {loading?"Resetting...":"Reset Password"}
                </button>
              </motion.div>
            )}
            {step==="done" && (
              <motion.div key="d" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center py-4">
                <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Done!</h2>
                <p className="text-white/50 text-sm mb-6">Password reset successfully</p>
                <button onClick={() => navigate("/login")} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold py-3 rounded-xl">
                  Go to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
