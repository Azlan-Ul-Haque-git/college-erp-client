import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/axiosInstance";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const EMPTY_SLOT = { startTime: "", endTime: "", subject: "", room: "" };
const EMPTY = { branch: "CSE", year: 1, semester: 1, day: "Monday", slots: [{ ...EMPTY_SLOT }] };

export default function ManageTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [filterBranch, setFilterBranch] = useState("CSE");
  const [filterSem, setFilterSem] = useState(1);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/timetable?branch=${filterBranch}&semester=${filterSem}`);
      setTimetable(data.timetable || []);
    } catch { toast.error("Failed to load timetable"); }
  };

  useEffect(() => { fetchData(); }, [filterBranch, filterSem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.slots.some(s => !s.startTime || !s.subject)) {
      toast.error("Fill all slot details!"); return;
    }
    setSubmitting(true);
    try {
      await api.post("/timetable", form);
      toast.success("Timetable entry added!"); setModal(false); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/timetable/${id}`); toast.success("Deleted!"); fetchData(); }
    catch { toast.error("Delete failed"); }
  };

  const addSlot = () => setForm(p => ({ ...p, slots: [...p.slots, { ...EMPTY_SLOT }] }));
  const removeSlot = (i) => setForm(p => ({ ...p, slots: p.slots.filter((_, idx) => idx !== i) }));
  const updateSlot = (i, key, val) => setForm(p => ({
    ...p, slots: p.slots.map((s, idx) => idx === i ? { ...s, [key]: val } : s)
  }));

  const grouped = DAYS.reduce((acc, day) => {
    acc[day] = timetable.filter(t => t.day === day);
    return acc;
  }, {});

  const dayColors = {
    Monday: "from-purple-500 to-purple-600", Tuesday: "from-blue-500 to-blue-600",
    Wednesday: "from-emerald-500 to-emerald-600", Thursday: "from-orange-500 to-orange-600",
    Friday: "from-pink-500 to-pink-600", Saturday: "from-teal-500 to-teal-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">📅 Timetable Management</h1>
          <p className="text-slate-500 text-sm">{timetable.length} entries</p>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setForm({ ...EMPTY, branch: filterBranch, semester: filterSem }); setModal(true); }}
          className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-4 h-4" /> Add Entry
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Branch</label>
          <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="input !py-2">
            {["CSE","IT","ECE","EE","ME","CE"].map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Semester</label>
          <select value={filterSem} onChange={e => setFilterSem(+e.target.value)} className="input !py-2">
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
          </select>
        </div>
      </div>

      {/* Timetable display */}
      <div className="space-y-4">
        {DAYS.map(day => (
          grouped[day]?.length > 0 && (
            <motion.div key={day} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-bold bg-gradient-to-r ${dayColors[day]} mb-4`}>
                {day}
              </div>
              <div className="space-y-2">
                {grouped[day].map((entry) =>
                  entry.slots.map((slot, si) => (
                    <div key={si} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                      <div className="text-xs font-bold text-purple-600 w-28 flex-shrink-0">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm dark:text-white">{slot.subject}</p>
                        <p className="text-xs text-slate-400">Room: {slot.room}</p>
                      </div>
                      {si === 0 && (
                        <button onClick={() => handleDelete(entry._id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )
        ))}
        {timetable.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400">No timetable entries for {filterBranch} Sem {filterSem}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-lg font-bold dark:text-white">Add Timetable Entry</h2>
                <button onClick={() => setModal(false)}><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Branch</label>
                    <select value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} className="input">
                      {["CSE","IT","ECE","EE","ME","CE"].map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Year</label>
                    <select value={form.year} onChange={e => setForm(p => ({ ...p, year: +e.target.value }))} className="input">
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Semester</label>
                    <select value={form.semester} onChange={e => setForm(p => ({ ...p, semester: +e.target.value }))} className="input">
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Day</label>
                  <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className="input">
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* Slots */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-500">Class Slots</label>
                    <button type="button" onClick={addSlot} className="text-xs text-purple-600 hover:underline">+ Add Slot</button>
                  </div>
                  <div className="space-y-3">
                    {form.slots.map((slot, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">Slot {i + 1}</span>
                          {form.slots.length > 1 && (
                            <button type="button" onClick={() => removeSlot(i)} className="text-red-400 text-xs">Remove</button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" placeholder="Start (9:00 AM)" value={slot.startTime}
                            onChange={e => updateSlot(i, "startTime", e.target.value)} className="input !py-2 text-xs" />
                          <input type="text" placeholder="End (10:00 AM)" value={slot.endTime}
                            onChange={e => updateSlot(i, "endTime", e.target.value)} className="input !py-2 text-xs" />
                          <input type="text" placeholder="Subject *" value={slot.subject}
                            onChange={e => updateSlot(i, "subject", e.target.value)} className="input !py-2 text-xs" />
                          <input type="text" placeholder="Room (CS-101)" value={slot.room}
                            onChange={e => updateSlot(i, "room", e.target.value)} className="input !py-2 text-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? "Saving..." : "Save Entry"}
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