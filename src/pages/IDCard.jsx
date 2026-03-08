import { useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function IDCard() {
  const { user } = useAuth();
  const cardRef = useRef();

  const handleDownload = () => {
    const card = cardRef.current;
    import("html2canvas").then(({ default: html2canvas }) => {
      html2canvas(card, { scale: 2, backgroundColor: null }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${user?.name}-ID-Card.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  };

  const roleColor = user?.role === "admin" ? "from-violet-600 to-purple-700"
    : user?.role === "faculty" ? "from-blue-600 to-cyan-700"
      : "from-emerald-600 to-teal-700";

  const roleBg = user?.role === "admin" ? "#7c3aed"
    : user?.role === "faculty" ? "#2563eb" : "#059669";

  return (
    <Layout>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">🪪 ID Card</h1>
          <p className="text-slate-500 text-sm mt-1">Download your digital ID card</p>
        </motion.div>

        {/* ID Card */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <div ref={cardRef} className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(135deg, #0f172a, #1e1b4b)", border: "2px solid rgba(255,255,255,0.1)" }}>

            {/* Top strip */}
            <div className={`bg-gradient-to-r ${roleColor} p-4 flex items-center justify-between`}>
              <div>
                <p className="text-white font-bold text-lg">College ERP</p>
                <p className="text-white/70 text-xs">Official Identity Card</p>
              </div>
              <div className="text-3xl">
                {user?.role === "admin" ? "🛡️" : user?.role === "faculty" ? "👨‍🏫" : "🎓"}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar"
                    className="w-24 h-24 rounded-2xl object-cover border-2"
                    style={{ borderColor: roleBg }} />
                ) : (
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${roleBg}, #7c3aed)` }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-xl truncate">{user?.name}</p>
                <p className="text-white/50 text-sm capitalize mb-3">{user?.role}</p>
                <div className="space-y-1">
                  <div className="flex gap-2 text-xs">
                    <span className="text-white/40">Email:</span>
                    <span className="text-white/80 truncate">{user?.email}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-white/40">ID:</span>
                    <span className="text-white/80">{user?._id?.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-white/40">Valid:</span>
                    <span className="text-white/80">2025 - 2028</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="px-6 pb-5">
              {/* Barcode style */}
              <div className="flex gap-0.5 h-8 items-end mb-2">
                {Array.from({ length: 40 }, (_, i) => (
                  <div key={i} className="flex-1 rounded-sm opacity-60"
                    style={{ height: `${Math.random() * 100}%`, background: roleBg }} />
                ))}
              </div>
              <p className="text-white/30 text-xs text-center tracking-widest">
                {user?._id?.toUpperCase()}
              </p>
            </div>

            {/* Holographic overlay */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)" }} />
          </div>
        </motion.div>

        {/* Download Button */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownload}
          className="btn-primary w-full flex items-center justify-center gap-2">
          📥 Download ID Card
        </motion.button>

        <p className="text-center text-slate-400 text-xs">
          This digital ID card is for personal use and does not replace any official identification issued by the college.
        </p>
      </div>
    </Layout>
  );
}