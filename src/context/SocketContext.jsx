import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import socket from "../utils/socket";
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user) return;

    // ✅ existing socket use करो (new io() मत बनाओ)
    socket.emit("user:online", user._id);

    socket.on("users:online", setOnlineUsers);

    return () => {
      socket.off("users:online", setOnlineUsers);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);