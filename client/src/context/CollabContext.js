// /context/CollabContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const CollabContext = createContext();

export const CollabProvider = ({ children }) => {

  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);

    s.on("presence-update", setUsers);
    s.on("cursor-update", setUsers);

    return () => s.disconnect();
  }, []);

  return (
    <CollabContext.Provider value={{ socket, users }}>
      {children}
    </CollabContext.Provider>
  );
};

export const useCollab = () => useContext(CollabContext);
