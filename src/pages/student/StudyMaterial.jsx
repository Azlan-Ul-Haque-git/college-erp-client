import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../utils/axiosInstance";

export default function StudyMaterial() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    api.get("/notes/student").then(r => setNotes(r.data.notes || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const typeIcon = (t) => t === "PDF" ? "📄" : t === "Video" ? "🎥" : t === "PPT" ? "📊" : "📝";
  const typeColor = (t) => t === "PDF" ? "bg-red-100 text-red-700" : t === "Video" ? "bg-blue-100 text-blue-700" : t === "PPT" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600";

  const filtered = notes.filter(n =>
    (filterType === "All" || n.fileType === filterType) &&
    (n.title?.toLowerCase().includes(search.toLowerCase()) || n.subject?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📚 Study Material</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search notes..." className="input flex-1" />
        <div className="flex gap-2">
          {["All", "PDF", "Video", "PPT", "Doc"].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition ${filterType === t ? "bg-purple-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-center text-slate-400 py-8">Loading...</p>
      : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-400">No study material found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((n, i) => (
            <motion.div key={n._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }} className="card hover:shadow-md transition group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{typeIcon(n.fileType)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor(n.fileType)}`}>
                  {n.fileType}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-purple-600 transition">
                {n.title}
              </h3>
              <p className="text-xs text-slate-500 mb-1">{n.subject} · Sem {n.semester}</p>
              <p className="text-xs text-slate-400 mb-3">By: {n.uploadedBy?.name || "Faculty"}</p>
              {n.description && <p className="text-xs text-slate-400 mb-3">{n.description}</p>}
              {n.fileUrl ? (
                <a href={n.fileUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium">
                  🔗 Open {n.fileType}
                </a>
              ) : (
                <p className="text-xs text-slate-300">No file attached</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
