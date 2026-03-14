// ✅ Updated NotesPage.jsx (Correct Version)
// 📁 pages/notes/NotesPage.jsx

import { useEffect, useState } from "react";
import { request } from "../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import "./notesPage.css";

export default function NotesPage() {
  const navigate = useNavigate();
  const { projectId } = useParams(); // if inside project route

  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [mainTab, setMainTab] = useState("mine"); // mine | project
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===============================
     LOAD NOTES
  =============================== */

  const loadMyNotes = async () => {
    setLoading(true);
    const data = await request("/notes/me");
    setNotes(data);
    setLoading(false);
  };

  const loadProjectNotes = async (pid) => {
    if (!pid) return;
    setLoading(true);
    const data = await request(`/notes/project/${pid}`);
    setNotes(data);
    setLoading(false);
  };

  /* ===============================
     INITIAL LOAD
  =============================== */

  useEffect(() => {
    request("/projects").then(setProjects);

    if (projectId) {
      // If inside /projects/:projectId/notes
      setMainTab("project");
      setSelectedProject(projectId);
      loadProjectNotes(projectId);
    } else {
      loadMyNotes();
    }
  }, [projectId]);

  /* ===============================
     TAB SWITCH HANDLERS
  =============================== */

  const handleMineTab = () => {
    setMainTab("mine");
    setSelectedProject(null);
    loadMyNotes();
  };

  const handleProjectTab = () => {
    setMainTab("project");

    if (projectId) {
      loadProjectNotes(projectId);
    }
  };

  /* ===============================
     NAVIGATION TO DETAILS
  =============================== */

  const openNote = (noteId) => {
    if (projectId) {
      navigate(`/projects/${projectId}/notes/${noteId}`);
    } else if (selectedProject) {
      navigate(`/projects/${selectedProject}/notes/${noteId}`);
    } else {
      navigate(`/notes/${noteId}`);
    }
  };

  return (
    <div className="notes-container">

      {/* ================= HEADER ================= */}
      <div className="notes-header">
        <h1 style={{color:'black'}} >Notes</h1>

        {/* 
        show my notes and by projects where project bane onlick show nptes by that project
        */}
        {/* TABS */}
        {/* ================= MAIN NAV TABS ================= */}
        <div className="notes-tabs">
          <div
            className={`tab ${mainTab === "mine" ? "active" : ""}`}
            onClick={handleMineTab}
          >
            My Notes
          </div>

          <div
            className={`tab ${mainTab === "project" ? "active" : ""}`}
            onClick={handleProjectTab}
          >
            By Project
          </div>
        </div>

        {!projectId && (
          <div className="notes-tabs">

            <div
              className={`tab ${activeTab === "mine" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("mine");
                loadNotes("mine");
              }}
            >
              My Notes
            </div>

            {projects.map((p) => (
              <div
                key={p._id}
                className={`tab ${activeTab === p._id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(p._id);
                  loadNotes("project", p._id);
                }}
              >
                {p.name}
              </div>
            ))}

          </div>
        )}

        <button
          className="create-btn"
          onClick={() => {
            if (projectId) {
              navigate(`/projects/${projectId}/notes/new`);
            } else if (selectedProject) {
              navigate(`/projects/${selectedProject}/notes/new`);
            } else {
              navigate("/notes/new");
            }
          }}
        >
          + New Note
        </button>
      </div>

      {/* ================= MAIN NAV TABS ================= */}
      {!projectId && (
        <div className="notes-main-tabs">
          <div
            className={`main-tab ${mainTab === "mine" ? "active" : ""}`}
            onClick={handleMineTab}
          >
            My Notes
          </div>

          <div
            className={`main-tab ${mainTab === "project" ? "active" : ""}`}
            onClick={handleProjectTab}
          >
            By Project
          </div>
        </div>
      )}

      {/* ================= PROJECT SELECTOR ================= */}
      {!projectId && mainTab === "project" && (
        <div className="project-selector">
          <select
            value={selectedProject || ""}
            onChange={(e) => {
              const pid = e.target.value;
              setSelectedProject(pid);
              loadProjectNotes(pid);
            }}
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ================= NOTES LIST ================= */}
      <div className="notes-body">
        {loading ? (
          <div className="notes-loading">Loading...</div>
        ) : (
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="notes-empty">
                No notes found.
              </div>
            ) : (
              notes.map((n) => (
                <div
                  key={n._id}
                  className="note-card"
                  onClick={() => openNote(n._id)}
                >
                  <div className="note-title">
                    {n.title || "Untitled"}
                  </div>
                  <div className="note-share-badge">
                    {n.visibility === "shared" && (
                      <div className="share-indicator">
                        🔗 Shared with {n.sharedWith?.length || 0}
                      </div>
                    )}
                  </div>
                  <div className="note-meta">
                    {n.visibility} •{" "}
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
