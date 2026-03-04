import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "from-violet-500 to-purple-600", delay = 0 }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay }}
      className="card flex items-center gap-4">
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
