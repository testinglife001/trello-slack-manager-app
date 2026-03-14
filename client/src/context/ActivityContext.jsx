// src/context/ActivityContext.jsx
import { createContext, useContext, useState } from "react";
import { request } from "../api/client";

const ActivityContext = createContext();
export const useActivity = () => useContext(ActivityContext);

export default function ActivityProvider({ children }) {
  const [logs, setLogs] = useState([]);

  const load = async (projectId) => {
    const data = await request(`/activity/project/${projectId}`);
    setLogs(data);
  };

  return (
    <ActivityContext.Provider value={{ logs, load }}>
      {children}
    </ActivityContext.Provider>
  );
}
