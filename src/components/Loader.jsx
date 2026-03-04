import { motion } from "framer-motion";
export default function Loader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div className="w-14 h-14 border-4 border-purple-300/20 border-t-purple-400 rounded-full mx-auto"
          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
        <p className="text-white/50 mt-4 text-sm">Loading...</p>
      </div>
    </div>
  );
}
