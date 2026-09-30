import { useEffect, useState, useRef, useCallback } from "react";
import api from "../utils/axiosInstance";
import socket from "../utils/socket";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef();

    /* ═════════ LOAD FROM SERVER ═════════ */
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/notifications");
            setNotifications(data.notifications || []);
        } catch (err) {
            console.error("Failed to load notifications:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    /* ═════════ REALTIME (socket) ═════════ */
    useEffect(() => {
        const handler = (data) => {
            // Socket se naya notification
            const newNotification = {
                _id: data._id || Date.now().toString(),
                title: data.title || "Notification",
                message: data.message || "",
                type: data.type || "notice",
                isRead: false,
                createdAt: data.createdAt || new Date().toISOString(),
            };

            setNotifications((prev) => [newNotification, ...prev]);
        };

        // Multiple event names — jo bhi server bhej raha ho
        socket.on("notification:message", handler);
        socket.on("notification:new", handler);
        socket.on("notification", handler);

        return () => {
            socket.off("notification:message", handler);
            socket.off("notification:new", handler);
            socket.off("notification", handler);
        };
    }, []);

    /* ═════════ POLLING (backup) ═════════ */
    useEffect(() => {
        // Har 60 seconds pe fetch karo (agar socket miss ho)
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    /* ═════════ CLOSE ON OUTSIDE CLICK ═════════ */
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    /* ═════════ ACTIONS ═════════ */
    const markAsRead = async (id) => {
        // Local update (instant feel)
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );

        // Server update
        try {
            await api.put(`/notifications/${id}/read`);
        } catch (err) {
            console.error("Mark read failed:", err);
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifs = notifications.filter((n) => !n.isRead);

        // Local
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        // Server — ek-ek ko mark karo
        try {
            await Promise.all(
                unreadNotifs.map((n) => api.put(`/notifications/${n._id}/read`))
            );
        } catch (err) {
            console.error("Mark all failed:", err);
        }
    };

    const clearAll = async () => {
        // Local
        setNotifications([]);

        // Server
        try {
            await api.delete("/notifications");
        } catch (err) {
            console.error("Clear failed:", err);
        }
    };

    const unread = notifications.filter((n) => !n.isRead).length;

    /* ═════════ UI ═════════ */
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="relative text-xl"
                aria-label="Notifications"
            >
                🔔
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 shadow-xl rounded-xl border dark:border-slate-700 z-50">
                    {/* HEADER */}
                    <div className="flex justify-between items-center px-4 py-3 border-b dark:border-slate-700">
                        <p className="font-semibold">
                            Notifications {unread > 0 && `(${unread})`}
                        </p>
                        <div className="flex gap-2">
                            {unread > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-500 hover:underline"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* LIST */}
                    <div className="max-h-80 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <p className="text-center text-gray-400 py-6">Loading...</p>
                        ) : notifications.length === 0 ? (
                            <p className="text-center text-gray-400 py-6">
                                No notifications
                            </p>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n._id}
                                    onClick={() => markAsRead(n._id)}
                                    className={`px-4 py-3 border-b dark:border-slate-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 ${!n.isRead ? "bg-blue-50 dark:bg-slate-700" : ""
                                        }`}
                                >
                                    <p className="text-sm font-medium">{n.title}</p>
                                    <p className="text-xs text-gray-500">{n.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(n.createdAt).toLocaleString("en-IN")}
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