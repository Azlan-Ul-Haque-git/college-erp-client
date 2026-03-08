import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { CameraIcon } from "@heroicons/react/24/outline";

export default function ProfileSettings() {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
    const [pass, setPass] = useState({ old: "", new: "", confirm: "" });
    const [saving, setSaving] = useState(false);
    const [savingPass, setSavingPass] = useState(false);
    const [avatar, setAvatar] = useState(user?.avatar || null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleProfileSave = async () => {
        setSaving(true);
        try {
            const { data } = await api.put("/auth/update-profile", form);
            updateUser(data.user);
            toast.success("Profile updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally { setSaving(false); }
    };

    const handlePasswordChange = async () => {
        if (pass.new !== pass.confirm) return toast.error("Passwords don't match!");
        if (pass.new.length < 6) return toast.error("Min 6 characters!");
        setSavingPass(true);
        try {
            await api.put("/auth/change-password", { oldPassword: pass.old, newPassword: pass.new });
            toast.success("Password changed!");
            setPass({ old: "", new: "", confirm: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed");
        } finally { setSavingPass(false); }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return toast.error("Image too large! Max 2MB");
        setUploadingAvatar(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const { data } = await api.put("/auth/update-avatar", { avatar: reader.result });
                setAvatar(reader.result);
                updateUser({ avatar: reader.result });
                toast.success("Profile picture updated!");
            } catch { toast.error("Upload failed"); }
            finally { setUploadingAvatar(false); }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Profile Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Apni profile update karo</p>
            </motion.div>

            {/* Avatar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Profile Picture</h3>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        {avatar ? (
                            <img src={avatar} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200" />
                        ) : (
                            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition">
                            <CameraIcon className="w-4 h-4 text-white" />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-slate-500 capitalize">{user?.role}</p>
                        <p className="text-xs text-slate-400 mt-1">{uploadingAvatar ? "Uploading..." : "Camera icon click karke photo change karo"}</p>
                    </div>
                </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Personal Information</h3>
                <div className="space-y-4">
                    {[
                        { label: "Full Name", name: "name", type: "text" },
                        { label: "Email Address", name: "email", type: "email" },
                        { label: "Phone Number", name: "phone", type: "text" },
                    ].map(f => (
                        <div key={f.name}>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{f.label}</label>
                            <input type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                                className="input" placeholder={f.label} />
                        </div>
                    ))}
                    <button onClick={handleProfileSave} disabled={saving} className="btn-primary w-full">
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </motion.div>

            {/* Change Password */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Change Password</h3>
                <div className="space-y-4">
                    {[
                        { label: "Current Password", name: "old" },
                        { label: "New Password", name: "new" },
                        { label: "Confirm New Password", name: "confirm" },
                    ].map(f => (
                        <div key={f.name}>
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{f.label}</label>
                            <input type="password" value={pass[f.name]} onChange={e => setPass(p => ({ ...p, [f.name]: e.target.value }))}
                                className="input" placeholder={f.label} />
                        </div>
                    ))}
                    <button onClick={handlePasswordChange} disabled={savingPass} className="btn-primary w-full">
                        {savingPass ? "Changing..." : "Change Password"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}