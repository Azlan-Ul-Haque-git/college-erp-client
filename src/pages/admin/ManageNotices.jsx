import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const CATS = ["general","exam","holiday","event","urgent"];
const CAT_COLORS = { general:"badge-green", exam:"badge-yellow", holiday:"badge-green", event:"badge-yellow", urgent:"badge-red" };

export default function ManageNotices() {
  const [notices, setNotices] = useState([]);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ title:"", content:"", category:"general", targetRole:"all" });
  const [submitting, setSubmitting] = useState(false);

  const fetch = useCallback(async () => {
    try { const { data } = await api.get("/notices"); setNotices(data.notices || []); }
    catch { toast.error("Failed to load"); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try { await api.post("/notices", form); toast.success("Notice posted!"); setModal(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    try { await api.delete(`/notices/${id}`); toast.success("Deleted"); fetch(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notice Board</h1>
        <motion.button whileTap={{scale:0.95}} onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Post Notice
        </motion.button>
      </div>
      <div className="space-y-4">
        {notices.map((n,i) => (
          <motion.div key={n._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={CAT_COLORS[n.category]}>{n.category}</span>
                  <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{n.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{n.content}</p>
              </div>
              <button onClick={() => handleDelete(n._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition flex-shrink-0">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {notices.length === 0 && <div className="card text-center text-slate-400 py-12">No notices posted yet</div>}
      </div>
      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Post Notice</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Title *</label>
                  <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required className="input" placeholder="Notice title" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Content *</label>
                  <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} required rows={4} className="input resize-none" placeholder="Notice details..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Category</label>
                    <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="input">
                      {CATS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Target</label>
                    <select value={form.targetRole} onChange={e=>setForm(p=>({...p,targetRole:e.target.value}))} className="input">
                      {["all","student","faculty"].map(r=><option key={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">{submitting?"Posting...":"Post Notice"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
