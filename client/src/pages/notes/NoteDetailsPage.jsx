// 🔥 FULL REWRITE – NoteDetailsPage.jsx
// 📁 pages/notes/NoteDetailsPage.jsx

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditorJS from "@editorjs/editorjs";
import Select from "react-select";
import { request } from "../../services/api";
import "./noteDetails.css";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../../components/ui/Avatar";
import Aviatar from "../../components/ui/Aviatar";

export default function NoteDetailsPage() {
  const socket = useSocket();
  
  const { noteId, projectId: routeProjectId } = useParams();
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const holderRef = useRef(null);

  const [note, setNote] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =============================
     LOAD NOTE + USERS + PROJECTS
  ============================= */

  useEffect(() => {
    load();
  }, [noteId]);

  const load = async () => {
    const [n, u, p] = await Promise.all([
      request(`/notes/${noteId}`),
      request("/notes/users"),
      request("/projects")
    ]);

    setNote(n);

    setUsers(
      u.map((x) => ({
        value: x._id,
        label: x.name
      }))
    );

    setProjects(p);
  };

  /* =============================
     INIT EDITOR
  ============================= */

  useEffect(() => {
    if (!note) return;

    let editorInstance;

    const init = async () => {
        // Safely destroy previous editor
        if (editorRef.current) {
        try {
            await editorRef.current.isReady;
            editorRef.current.destroy();
        } catch (e) {
            console.warn("Editor destroy skipped");
        }
        editorRef.current = null;
        }

        editorInstance = new EditorJS({
        holder: holderRef.current,
        data: note.content || { blocks: [] },
        readOnly: !editMode,
        autofocus: editMode
        });

        await editorInstance.isReady;
        editorRef.current = editorInstance;
    };

    init();

    return () => {
        if (editorRef.current) {
        editorRef.current.isReady
            .then(() => editorRef.current.destroy())
            .catch(() => {});
        editorRef.current = null;
        }
    };

  }, [note, editMode]);


  /* =============================
     SAVE
  ============================= */

  const save = async () => {
    if (!editorRef.current) return;

    setLoading(true);

    const content = await editorRef.current.saver.save();

    const updated = await request(`/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify({
        title: note.title,
        content,
        visibility: note.visibility,
        sharedWith:
            note.visibility === "shared"
            ? note.sharedWith
            : [],
        pinned: note.pinned,
        archived: note.archived,
        project: note.project?._id || note.project || null,
        linkedCard: note.linkedCard,
        linkedSubtask: note.linkedSubtask,
        parentNote: note.parentNote?._id || null,
        path: note.path
        })
    });

    setNote(updated);
    if (updated.visibility !== "shared") {
        setNote({
            ...updated,
            sharedWith: []
        });
    }
    setEditMode(false);
    setLoading(false);
  };

  useEffect(() => {
    if (!socket) return;

    socket.emit("note:join", { noteId });

    socket.on("note:share_updated", (data) => {
        if (data.noteId === noteId) {
        setNote(prev => ({
            ...prev,
            sharedWith: data.sharedWith
        }));
        }
    });

    socket.on("note:share_revoked", (data) => {
        if (data.noteId === noteId) {
        navigate("/notes");
        }
    });

    return () => {
        socket.emit("note:leave", noteId);
        socket.off("note:share_updated");
        socket.off("note:share_revoked");
    };
  }, [socket, noteId]);

  // console.log(note?.sharedWith)
  // note?.sharedWith.map(u => console.log(u))

  // note.sharedWith?.slice(0, 5).map(u => (console.log(u)))

  
  useEffect(() => {
    if (!note || !Array.isArray(note.sharedWith) || note.sharedWith.length === 0) {
        return;
    }

    request("/auth/by-ids", {
        method: "POST",
        body: JSON.stringify({
            ids: note.sharedWith
        })
        }).then(res => {
        setSharedUsers(res);
    });


  }, [note]);

  


  if (!note) return <div>Loading...</div>;

  /* =============================
     UI
  ============================= */

  return (
    <div className="create-note-container">

      {/* HEADER (LIKE CREATE PAGE) */}
      <div className="create-note-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)}>← Back</button>
          <h1>{editMode ? "Edit Note" : "Note Details"}</h1>
        </div>

        {editMode ? (
          <button
            className="primary-btn"
            onClick={save}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        ) : (
          <button
            className="primary-btn"
            onClick={() => setEditMode(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className="create-note-grid">
        <div className="split-wrapper">

          {/* ================= LEFT PANEL ================= */}
          <div className="left-panel">

            {/* TITLE */}
            <div className="field">
              <label>Title</label>
              <input
                value={note.title || ""}
                disabled={!editMode}
                onChange={(e) =>
                  setNote({ ...note, title: e.target.value })
                }
              />
            </div>

            {/* PROJECT */}
            {!routeProjectId && (
              <div className="field">
                <label>Project</label>
                <select
                  disabled={!editMode}
                  value={
                    note.project?._id ||
                    note.project ||
                    ""
                  }
                  onChange={(e) =>
                    setNote({
                      ...note,
                      project: e.target.value
                    })
                  }
                >
                  <option value="">No Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* VISIBILITY */}
            <div className="field">
              <label>Visibility</label>
              <select
                disabled={!editMode}
                value={note.visibility}
                onChange={(e) =>
                  setNote({
                    ...note,
                    visibility: e.target.value
                  })
                }
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
                <option value="project">Project</option>
                <option value="public">Public</option>
              </select>
            </div>

            {/* SHARED USERS */}
            {note.visibility === "shared" && (
              <div className="field">
                <label>Share With</label>
                <Select
                  isMulti
                  isDisabled={!editMode}
                  options={users}
                  value={users.filter((u) =>
                    note.sharedWith?.includes(u.value)
                  )}
                  onChange={(selected) =>
                    setNote({
                      ...note,
                      sharedWith: selected
                        ? selected.map((s) => s.value)
                        : []
                    })
                  }
                />
              </div>
            )}

            
            {note.visibility === "shared" && (
                 
            <div className="share-avatars">
                {sharedUsers.slice(0, 5).map(user => (
                    <Aviatar key={user._id} user={user} />
                ))}
                {sharedUsers.length > 5 && (
                <span>+{sharedUsers.length - 5}</span>
                )}
            </div>
            )}

            {/*<div className="note-share-badge">
            {note.visibility === "shared" && note.sharedWith?.length > 0 && (
                <>
                <div className="share-avatars">
                    {note.sharedWith.slice(0, 5).map(user => (
                    <Avatar key={user._id} user={user} size={26} />
                    ))}

                    {note.sharedWith.length > 5 && (
                    <span className="share-count">
                        +{note.sharedWith.length - 5}
                    </span>
                    )}
                </div>

                <div className="share-names">
                    {note.sharedWith
                    .map(u => u.name || u.username)
                    .join(", ")}
                </div>
                </>
            )}
            </div>
            */}


            {/* PINNED + ARCHIVED */}
            <div className="field-row">
              <label>
                <input
                  type="checkbox"
                  disabled={!editMode}
                  checked={note.pinned}
                  onChange={() =>
                    setNote({
                      ...note,
                      pinned: !note.pinned
                    })
                  }
                />
                Pinned
              </label>

              <label>
                <input
                  type="checkbox"
                  disabled={!editMode}
                  checked={note.archived}
                  onChange={() =>
                    setNote({
                      ...note,
                      archived: !note.archived
                    })
                  }
                />
                Archived
              </label>
            </div>

            {/* ADVANCED */}
            <div className="advanced-section">
              <h3>Advanced Linking</h3>

              <input
                disabled={!editMode}
                placeholder="Linked Card ID"
                value={note.linkedCard || ""}
                onChange={(e) =>
                  setNote({
                    ...note,
                    linkedCard: e.target.value
                  })
                }
              />

              <input
                disabled={!editMode}
                placeholder="Linked Subtask ID"
                value={note.linkedSubtask || ""}
                onChange={(e) =>
                  setNote({
                    ...note,
                    linkedSubtask: e.target.value
                  })
                }
              />

              <input
                disabled={!editMode}
                placeholder="Parent Note ID"
                value={note.parentNote?._id || ""}
                onChange={(e) =>
                  setNote({
                    ...note,
                    parentNote: e.target.value
                  })
                }
              />

              <input
                disabled={!editMode}
                placeholder="Wiki Path"
                value={note.path || ""}
                onChange={(e) =>
                  setNote({
                    ...note,
                    path: e.target.value
                  })
                }
              />
            </div>
          </div>

          {/* RESIZER (Optional) */}
          <div className="resizer" />

          {/* ================= RIGHT PANEL ================= */}
          <div className="right-panel">
            <label className="editor-label">
              Content
            </label>
            <div
              ref={holderRef}
              className="editor-holder"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
