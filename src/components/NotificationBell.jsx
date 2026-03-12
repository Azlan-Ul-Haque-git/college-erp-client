import { useEffect, useState } from "react";
import api from "../utils/axiosInstance";
import socket from "../utils/socket";

export default function NotificationBell() {

    const [notifications, setNotifications] = useState([]);

    // Load existing notifications
    useEffect(() => {

        api.get("/notifications")
            .then(res => {
                setNotifications(res.data.notifications || []);
            })
            .catch(() => { });

    }, []);

    // Listen realtime notifications
    useEffect(() => {

        socket.on("notification:message", (data) => {

            const newNotification = {
                title: "New Message",
                message: data.message,
                isRead: false
            };

            setNotifications(prev => [newNotification, ...prev]);

        });

        return () => socket.off("notification:message");

    }, []);

    const unread = notifications.filter(n => !n.isRead).length;

    return (

        <div className="relative">

            <button className="text-xl">
                🔔
            </button>

            {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unread}
                </span>
            )}

        </div>

    );

}