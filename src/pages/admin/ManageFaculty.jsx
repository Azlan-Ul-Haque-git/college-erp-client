import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

const EMPTY = { name:"", email:"", password:"", phone:"", employeeId:"", department:"CSE", designation:"Lecturer", qualification:"", experience:0, subjects:"" };

export default function ManageFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const fetchFaculty = useCallback(async () => {
    try { const { data } = await api.get("/faculty"); setFaculty(data.faculty || []); }
    catch { toast.error("Failed to load faculty"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form, subjects: form.subjects.split(",").map(s=>s.trim()) };
      if (editing) { await api.put(`/faculty/${editing}`, payload); toast.success("Faculty updated!"); }
      else { await api.post("/auth/register", { ...payload, role:"faculty" }); toast.success("Faculty added!"); }
      setModal(false); fetchFaculty();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this faculty?")) return;
    try { await api.delete(`/faculty/${id}`); toast.success("Deleted"); fetchFaculty(); }
    catch { toast.error("Delete failed"); }
  };

  const filtered = faculty.filter(f =>
    f.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Manage Faculty</h1>
          <p className="text-slate-500 text-sm">{faculty.length} total faculty members</p>
        </div>
        <motion.button whileTap={{scale:0.95}} onClick={() => { setEditing(null); setForm(EMPTY); setModal(true); }} className="btn-primary flex items-center gap-2 self-start">
          <PlusIcon className="w-4 h-4" /> Add Faculty
        </motion.button>
      </div>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or department..." className="input pl-10" />
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>{["Name","Employee ID","Department","Designation","Subjects","Action"].map(h=>(
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading...</td></tr>
              : filtered.map((f,i) => (
                <motion.tr key={f._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {f.user?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700 dark:text-slate-200">{f.user?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{f.employeeId}</td>
                  <td className="px-4 py-3"><span className="badge-green">{f.department}</span></td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{f.designation}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{f.subjects?.join(", ")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(f._id); setForm({name:f.user?.name||"",email:f.user?.email||"",password:"",phone:f.user?.phone||"",employeeId:f.employeeId,department:f.department,designation:f.designation,qualification:f.qualification||"",experience:f.experience||0,subjects:f.subjects?.join(",")||""}); setModal(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(f._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition">
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
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">{editing ? "Edit Faculty" : "Add Faculty"}</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {label:"Full Name",   name:"name",        type:"text",     required:true},
                  {label:"Email",       name:"email",       type:"email",    required:true},
                  {label:"Password",    name:"password",    type:"password", required:!editing},
                  {label:"Phone",       name:"phone",       type:"text"},
                  {label:"Employee ID", name:"employeeId",  type:"text",     required:true},
                  {label:"Qualification",name:"qualification",type:"text"},
                  {label:"Experience (yrs)",name:"experience",type:"number"},
                  {label:"Subjects (comma separated)",name:"subjects",type:"text"},
                ].map(f => (
                  <div key={f.name} className={f.name==="subjects"?"sm:col-span-2":""}>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{f.label}</label>
                    <input type={f.type} value={form[f.name]} onChange={e=>setForm(p=>({...p,[f.name]:e.target.value}))} required={f.required} className="input" placeholder={f.label} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Department</label>
                  <select value={form.department} onChange={e=>setForm(p=>({...p,department:e.target.value}))} className="input">
                    {["CSE","IT","ECE","EE","ME","CE","MCA","MBA"].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Designation</label>
                  <select value={form.designation} onChange={e=>setForm(p=>({...p,designation:e.target.value}))} className="input">
                    {["Lecturer","Asst. Professor","Associate Professor","Professor","HOD"].map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">{submitting?"Saving...":editing?"Update":"Add Faculty"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
