// 📁 pages/notes/CreateNotePage.jsx
import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "../../services/api";
import Select from "react-select";
import "./createNote.css";


export default function CreateNotePage() {
  const navigate = useNavigate();
  const { projectId: routeProjectId } = useParams();

  const editorRef = useRef();
  const holderRef = useRef();

  // Core fields
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [pinned, setPinned] = useState(false);
  const [archived, setArchived] = useState(false);

  // Relations
  const [projectId, setProjectId] = useState(routeProjectId || "");
  const [projects, setProjects] = useState([]);
  const [linkedCard, setLinkedCard] = useState("");
  const [linkedSubtask, setLinkedSubtask] = useState("");
  const [parentNote, setParentNote] = useState("");
  const [path, setPath] = useState("");

  // Sharing
  const [users, setUsers] = useState([]);
  const [sharedWith, setSharedWith] = useState([]);

  const [loading, setLoading] = useState(false);

  // Load users
  useEffect(() => {
    request("/notes/users")
        .then((data) => {
        const formatted = data.map((u) => ({
            value: u._id,
            label: u.name,
            avatar: u.avatar
        }));
        setUsers(formatted);
        })
        .catch(() => {});
  }, []);


  // Load projects if not in project route
  useEffect(() => {
    if (!routeProjectId) {
      request("/projects").then(setProjects).catch(() => {});
    }
  }, [routeProjectId]);



  // Init EditorJS
  useEffect(() => {
    let editor;

    const init = async () => {
      editor = new EditorJS({
        holder: holderRef.current,
        autofocus: true,
        data: { blocks: [] }
      });

      await editor.isReady;
      editorRef.current = editor;
    };

    init();

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const toggleShare = (id) => {
    setSharedWith((prev) =>
      prev.includes(id)
        ? prev.filter((u) => u !== id)
        : [...prev, id]
    );
  };

  const create = async () => {
    if (!title.trim()) return;

    setLoading(true);

    const content = await editorRef.current.saver.save();

    try {
      const note = await request("/notes", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          visibility,
          pinned,
          archived,
          project: projectId || null,
          linkedCard: linkedCard?.length === 24 ? linkedCard : null,
          linkedSubtask: linkedSubtask?.length === 24 ? linkedSubtask : null,
          parentNote: parentNote?.length === 24 ? parentNote : null,

          path: path || "",
          sharedWith: visibility === "shared" ? sharedWith : []
        })
      });

      const finalProjectId = projectId || routeProjectId;

      navigate(
        finalProjectId
          ? `/projects/${finalProjectId}/notes/${note._id}`
          : `/notes/${note._id}`
      );

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-note-container">

    {/* STICKY HEADER */}
    <div className="create-note-header" id="noteHeader">
      <div className="header-left">
        <button
          className="collapse-btn"
          onClick={() =>
            document
              .querySelector(".left-panel")
              .classList.toggle("collapsed")
          }
        >
          ☰
        </button>
        <h1>Create New Note</h1>
      </div>

      <button
        className="primary-btn"
        onClick={create}
        disabled={loading}
      >
        {loading ? "Creating..." : "Save Note"}
      </button>
    </div>


      <div className="create-note-grid">

        

        {/* SPLIT LAYOUT */}
        <div className="split-wrapper">

        <div className="left-panel">
         

          <div className="field">
            <label>Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
            />
          </div>

          {/* PROJECT SELECTION */}
          {!routeProjectId && (
            <div className="field">
              <label>Project</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
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

          <div className="field">
            <label>Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="private">Private</option>
              <option value="shared">Shared</option>
              <option value="project">Project</option>
              <option value="public">Public</option>
            </select>
          </div>

          {visibility === "shared" && (
            <div className="field">
                <label>Share With</label>

                <Select
                isMulti
                options={users}
                value={users.filter(u =>
                    sharedWith.includes(u.value)
                )}
                onChange={(selected) => {
                    const values = selected
                        ? selected.map(s => s.value)
                        : [];

                    setSharedWith(values);

                    if (values.length > 0) {
                        setVisibility("shared");
                    }
                }}

                placeholder="Search users..."
                className="react-select-container"
                classNamePrefix="react-select"
                />
            </div>
            )}


          <div className="field-row" style={{color:'black'}} >
            <label >
              <input
                type="checkbox"
                checked={pinned}
                onChange={() => setPinned(!pinned)}
              />
              Pinned
            </label>

            <label>
              <input
                type="checkbox"
                checked={archived}
                onChange={() => setArchived(!archived)}
              />
              Archived
            </label>
          </div>

          <div className="advanced-section">
            <h3>Advanced Linking</h3>

            <input
              placeholder="Linked Card ID"
              value={linkedCard}
              onChange={(e) => setLinkedCard(e.target.value)}
            />

            <input
              placeholder="Linked Subtask ID"
              value={linkedSubtask}
              onChange={(e) => setLinkedSubtask(e.target.value)}
            />

            <input
              placeholder="Parent Note ID"
              value={parentNote}
              onChange={(e) => setParentNote(e.target.value)}
            />

            <input
              placeholder="Wiki Path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </div>

        </div>
      

        {/* RESIZER */}
        <div
            className="resizer"
            onMouseDown={(e) => {
            const left = document.querySelector(".left-panel");

            const startX = e.clientX;
            const startWidth = left.offsetWidth;

            const onMove = (ev) => {
                left.style.width =
                startWidth + (ev.clientX - startX) + "px";
            };

            const onUp = () => {
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
            };

            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
            }}
        />

        <div className="right-panel">
            <label className="editor-label">Content</label>
            <div ref={holderRef} className="editor-holder" />
        </div>
         </div>   

      </div>
    </div>
  );
}
