// src/context/SocketContext.jsx
// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");

    const s = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);

      if (user?._id) {
        s.emit("join-user", user._id);
      }
    });

    s.on("connect_error", err =>
      console.warn("Socket error:", err.message)
    );

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}





/*
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");

    const s = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    s.on("connect", () => {
      console.log("Socket connected:", s.id);

      if (user?._id) {
        s.emit("join-user", user._id);
      }
    });

    s.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    s.on("mention", data => onMention?.(data));
    s.on("canvas:update", data => onCanvasUpdate?.(data));

    // setSocket(s);

    // s.on("connect", () => console.log("Socket connected:", s.id));
    s.on("connect_error", err => console.warn("Socket error:", err.message));
    // s.on("disconnect", reason => console.log("Socket disconnected:", reason));

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
*/







/*
// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    const s = io("http://localhost:5000", {
      auth: { token },
      // Gracefully fall back to polling if WS is blocked
      transports: ["websocket", "polling"],
    });

    s.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
*/




/*
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");

    const s = io("http://localhost:5000", {
      auth: { token }
    });

    setSocket(s);

    return () => s.disconnect();
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
*/

