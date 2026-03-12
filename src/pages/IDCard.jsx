import { useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

export default function IDCard() {
  const { user } = useAuth();
  const cardRef = useRef();

  const handleDownload = () => {
    import("html2canvas").then(({ default: html2canvas }) => {
      html2canvas(cardRef.current, { scale: 2, backgroundColor: null }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${user?.name}-ID-Card.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
    });
  };

  const roleColor =
    user?.role === "admin" ? "from-violet-600 to-purple-700" :
      user?.role === "faculty" ? "from-blue-600 to-cyan-700" :
        "from-emerald-600 to-teal-700";

  const roleBg =
    user?.role === "admin" ? "#7c3aed" :
      user?.role === "faculty" ? "#2563eb" :
        "#059669";

  const roleEmoji =
    user?.role === "admin" ? "🛡️" :
      user?.role === "faculty" ? "👨‍🏫" : "🎓";

  return (
    <Layout>
      {/* Full-width wrapper — padding adapts to screen size */}
      <div className="w-full max-w-sm mx-auto space-y-5 px-3 sm:px-4 py-4">

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">
            🪪 ID Card
          </h1>
          <p className="text-slate-500 text-sm mt-1">Download your digital ID card</p>
        </motion.div>

        {/* ID Card — constrained width, never overflows */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div
            ref={cardRef}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl w-full"
            style={{
              background: "linear-gradient(135deg, #0f172a, #1e1b4b)",
              border: "2px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Top color strip */}
            <div className={`bg-gradient-to-r ${roleColor} px-4 py-3 sm:py-4 flex items-center justify-between`}>
              <div>
                <p className="text-white font-bold text-base sm:text-lg leading-tight">
                  College ERP
                </p>
                <p className="text-white/70 text-xs">Official Identity Card</p>
              </div>
              <span className="text-2xl sm:text-3xl">{roleEmoji}</span>
            </div>

            {/* Main content */}
            <div className="p-4 sm:p-6 flex gap-3 sm:gap-4 items-start">
              {/* Avatar — fixed size, never shrinks too small */}
              <div className="flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl object-cover border-2"
                    style={{ borderColor: roleBg }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl
                               flex items-center justify-center text-3xl sm:text-4xl
                               font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${roleBg}, #7c3aed)` }}
                  >
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info block — min-w-0 prevents flex overflow */}
              <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                {/* Name — clamp to 2 lines on very small screens */}
                <p
                  className="text-white font-bold text-base sm:text-xl leading-tight
                             overflow-hidden"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {user?.name}
                </p>
                <p className="text-white/50 text-xs sm:text-sm capitalize mb-2">
                  {user?.role}
                </p>

                {/* Details */}
                <div className="space-y-1">
                  {[
                    { label: "Email", value: user?.email },
                    { label: "ID", value: user?._id?.slice(-8).toUpperCase() },
                    { label: "Valid", value: "2025 – 2028" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-1.5 text-xs leading-snug">
                      <span className="text-white/40 flex-shrink-0 w-8">{label}:</span>
                      {/* email can be long — break it */}
                      <span
                        className="text-white/80 min-w-0 break-all"
                        style={{ wordBreak: "break-word" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barcode strip */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-5">
              <div className="flex gap-px h-7 sm:h-8 items-end mb-1.5 overflow-hidden">
                {Array.from({ length: 36 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      // Deterministic heights (no Math.random — stable on re-render)
                      height: `${[80, 50, 100, 60, 90, 40, 70, 55, 85, 65, 95, 45, 75, 60, 100, 50, 80, 70, 90, 55, 65, 100, 40, 80, 60, 75, 95, 50, 85, 70, 45, 100, 60, 80, 55, 90][i % 36]}%`,
                      background: roleBg,
                      opacity: 0.65,
                    }}
                  />
                ))}
              </div>
              <p className="text-white/25 text-xs text-center tracking-widest truncate">
                {user?._id?.toUpperCase()}
              </p>
            </div>

            {/* Holographic shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)",
              }}
            />
          </div>
        </motion.div>

        {/* Download button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          📥 Download ID Card
        </motion.button>

        <p className="text-center text-slate-400 text-xs leading-relaxed">
          This digital ID card is for personal use and does not replace any official
          identification issued by the college.
        </p>
      </div>
    </Layout>
  );
}