import { useEffect, useState, useRef } from "react";
import api from "../utils/axiosInstance";
import socket from "../utils/socket";

export default function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    /* ================= LOAD ================= */
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get("/notifications");
                setNotifications(res.data.notifications || []);
            } catch (err) {
                console.log(err);
            }
        };
        fetchNotifications();
    }, []);

    /* ================= REALTIME ================= */
    useEffect(() => {

        const handler = (data) => {
            const newNotification = {
                _id: Date.now(),
                title: "New Message",
                message: data.message,
                isRead: false,
                createdAt: new Date()
            };

            setNotifications(prev => [newNotification, ...prev]);
        };

        socket.on("notification:message", handler);

        return () => socket.off("notification:message", handler);

    }, []);

    /* ================= CLOSE ON OUTSIDE ================= */
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    /* ================= ACTIONS ================= */

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch { }
    };

    const clearAll = async () => {
        try {
            await api.delete("/api/notifications");
            setNotifications([]);
        } catch { }
    };

    const unread = notifications.filter(n => !n.isRead).length;

    /* ================= UI ================= */

    return (
        <div className="relative" ref={dropdownRef}>

            {/* 🔔 BUTTON */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="relative text-xl"
            >
                🔔

                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {unread}
                    </span>
                )}
            </button>

            {/* 🔽 DROPDOWN */}
            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 shadow-xl rounded-xl border dark:border-slate-700 z-50">

                    {/* HEADER */}
                    <div className="flex justify-between items-center px-4 py-3 border-b dark:border-slate-700">
                        <p className="font-semibold">Notifications</p>
                        <button
                            onClick={clearAll}
                            className="text-xs text-red-500 hover:underline"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* LIST */}
                    <div className="max-h-80 overflow-y-auto">

                        {notifications.length === 0 ? (
                            <p className="text-center text-gray-400 py-6">
                                No notifications
                            </p>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n._id}
                                    onClick={() => markAsRead(n._id)}
                                    className={`px-4 py-3 border-b dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700
                  ${!n.isRead ? "bg-blue-50 dark:bg-slate-700" : ""}`}
                                >
                                    <p className="text-sm font-medium">{n.title}</p>
                                    <p className="text-xs text-gray-500">{n.message}</p>

                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(n.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}