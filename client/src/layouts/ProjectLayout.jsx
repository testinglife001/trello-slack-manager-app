// layouts/ProjectLayout.jsx
// import Sidebar from "../modules/sidebar/Sidebar";
import { Outlet, useMatch } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../modules/sidebar/Sidebar";
import { useProject } from "../context/ProjectContext";
import ProjectNavbar from "./ProjectNavbar";
import CanvasBoard from "../modules/canvas/CanvasBoard";
import ProjectActivitySidebar from "../modules/activity/ProjectActivitySidebar";
import "./projectlayout.css";

export default function ProjectLayout() {
  const { loading, project } = useProject();
  const isChannel = useMatch("/projects/:projectId/channels/:channelId");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [canvasOpen, setCanvasOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500 font-semibold">
        Project not found or failed to load.
      </div>
    );
  }

  return (
    <div className="project-layout">
      {/* ================= NAVBAR ================= */}
      <ProjectNavbar
        toggleSidebar={() => setSidebarCollapsed(s => !s)}
        toggleCanvas={() => setCanvasOpen(c => !c)}
        showCanvasButton={!!isChannel}
      />

      {/* ================= BODY ================= */}
      <div className="project-body">
        {!sidebarCollapsed && <Sidebar />}

        <div className="project-workspace">
          <div className="project-main-content">
            <Outlet />
          </div>

          {isChannel && canvasOpen && (
            <div className="layout-canvas">
              <CanvasBoard />
            </div>
          )}

          <ProjectActivitySidebar />
        </div>
      </div>
    </div>
  );
}
