// contexts/ProjectContext.jsx
// src/context/ProjectContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "./SocketContext";
import { request } from "../api/client";

const ProjectContext = createContext(null);

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside <ProjectProvider>");
  return ctx;
};

export default function ProjectProvider({ children }) {
  const { projectId } = useParams();
  const socket = useSocket();

  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Load project data ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    request(`/projects/${projectId}`)
      .then(setProject)
      .catch(err => console.error("Failed to load project:", err))
      .finally(() => setLoading(false));
  }, [projectId]);

  // ── Join socket room for this project ───────────────────────────────────────
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit("join-project", projectId);

    return () => socket.emit("leave-project", projectId);
  }, [socket, projectId]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        projectId,
        role,
        setRole,
        permissions,
        setPermissions,
        loading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}


/*
// contexts/ProjectContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { request } from "../services/api";
import { useParams } from "react-router-dom";
import { useSocket } from "./SocketContext";

const ProjectContext = createContext();


export default function ProjectProvider({ children }) {
  const { projectId } = useParams();
  const socket = useSocket();

  const [project, setProject] = useState(null);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (!projectId) return;

    const load = async () => {
      const data = await request(`/projects/${projectId}`);
      setProject(data);
    };

    load();
  }, [projectId]);

  // 🔥 join socket room
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit("join-project", projectId);
  }, [socket, projectId]);

  return (
    <ProjectContext.Provider
      value={{
        project,
        projectId,
        role,
        permissions,
        setRole,
        setPermissions
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);
*/


/*
import { createContext, useContext, useState } from "react";

const ProjectContext = createContext();
export const useProject = () => useContext(ProjectContext);

export default function ProjectProvider({ children }) {
  const [currentProject, setCurrentProject] = useState(null);

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
      {children}
    </ProjectContext.Provider>
  );
}
*/
