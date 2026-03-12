import { motion } from "framer-motion";

/**
 * StatCard
 * Props:
 *  title    – string
 *  value    – string | number
 *  subtitle – string (optional)
 *  icon     – Lucide React component (or any SVG component)
 *  color    – Tailwind gradient string, default "from-violet-500 to-purple-600"
 *  delay    – animation delay (seconds)
 *  onClick  – optional click handler
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "from-violet-500 to-purple-600",
  delay = 0,
  onClick,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`card flex items-center gap-3 sm:gap-4 min-w-0
        ${onClick ? "cursor-pointer hover:shadow-md active:scale-[0.98] transition-all" : ""}
      `}
    >
      {/* Icon box — fixed size, never shrinks */}
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br ${color}
          rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0`}
      >
        {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
      </div>

      {/* Text — min-w-0 so it can shrink and truncate properly */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
          {title}
        </p>

        {/* Value — clamp font on very small screens */}
        <p
          className="font-bold text-slate-800 dark:text-white leading-tight"
          style={{ fontSize: "clamp(1.1rem, 4vw, 1.5rem)" }}
        >
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * StatCardGrid — responsive grid wrapper
 * Automatically adjusts columns based on available space.
 *
 * Usage:
 *   <StatCardGrid>
 *     <StatCard ... />
 *     <StatCard ... />
 *   </StatCardGrid>
 */
export function StatCardGrid({ children, className = "" }) {
  return (
    <div
      className={`grid gap-3 sm:gap-4 ${className}`}
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))",
      }}
    >
      {children}
    </div>
  );
}