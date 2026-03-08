import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const EMPTY = { name:"", email:"", password:"", phone:"", rollNo:"", branch:"CSE", year:1, semester:1, section:"A", admissionNo:"", parentName:"", parentPhone:"" };

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      const { data } = await api.get("/students");
      setStudents(data.students || []);
    } catch { toast.error("Failed to load students"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openAdd  = () => { setEditing(null); setForm(EMPTY); setShowPassword(false); setModal(true); };
  const openEdit = (s) => {
    setEditing(s._id);
    setForm({ name:s.user?.name||"", email:s.user?.email||"", password:"", phone:s.user?.phone||"",
      rollNo:s.rollNo, branch:s.branch, year:s.year, semester:s.semester, section:s.section,
      admissionNo:s.admissionNo||"", parentName:s.parentName||"", parentPhone:s.parentPhone||"" });
    setShowPassword(false);
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/students/${editing}`, form);
        toast.success("Student updated!");
      } else {
        await api.post("/auth/register", { ...form, role:"student" });
        toast.success("Student added!");
      }
      setModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success("Student deleted");
      fetchStudents();
    } catch { toast.error("Delete failed"); }
  };

  const filtered = students.filter(s =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNo?.toLowerCase().includes(search.toLowerCase()) ||
    s.branch?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Students</h1>
          <p className="text-slate-500 text-sm">{students.length} total students</p>
        </div>
        <motion.button whileTap={{ scale:0.95 }} onClick={openAdd} className="btn-primary flex items-center gap-2 self-start">
          <PlusIcon className="w-4 h-4" /> Add Student
        </motion.button>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, roll no, branch..."
          className="input pl-10" />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                {["Name","Roll No","Branch","Year","Section","Email","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400">No students found</td></tr>
              ) : filtered.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {s.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{s.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.rollNo}</td>
                  <td className="px-4 py-3"><span className="badge-green">{s.branch}</span></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Year {s.year}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.section}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{s.user?.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{editing ? "Edit Student" : "Add New Student"}</h2>
                <button onClick={() => setModal(false)} className="p-1 text-slate-400 hover:text-slate-600 transition">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label:"Full Name",    name:"name",        type:"text",   required:true },
                  { label:"Email",        name:"email",       type:"email",  required:true },
                  { label:"Phone",        name:"phone",       type:"text" },
                  { label:"Roll No",      name:"rollNo",      type:"text",   required:true },
                  { label:"Admission No", name:"admissionNo", type:"text" },
                  { label:"Parent Name",  name:"parentName",  type:"text" },
                  { label:"Parent Phone", name:"parentPhone", type:"text" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{f.label}{f.required && " *"}</label>
                    <input type={f.type} value={form[f.name]} onChange={e => setForm(p=>({...p, [f.name]:e.target.value}))}
                      required={f.required} className="input" placeholder={f.label} />
                  </div>
                ))}

                {/* Password with show/hide */}
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Password{!editing && " *"}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      required={!editing}
                      className="input pr-10"
                      placeholder="Password"
                    />
                    <button type="button" onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Branch *</label>
                  <select value={form.branch} onChange={e=>setForm(p=>({...p, branch:e.target.value}))} className="input">
                    {["CSE","IT","ECE","EE","ME","CE"].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Year *</label>
                  <select value={form.year} onChange={e=>setForm(p=>({...p, year:+e.target.value}))} className="input">
                    {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Semester *</label>
                  <select value={form.semester} onChange={e=>setForm(p=>({...p, semester:+e.target.value}))} className="input">
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Section *</label>
                  <select value={form.section} onChange={e=>setForm(p=>({...p, section:e.target.value}))} className="input">
                    {["A","B","C","D"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Saving..." : editing ? "Update" : "Add Student"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        
      </AnimatePresence>
    </div>
  );
}