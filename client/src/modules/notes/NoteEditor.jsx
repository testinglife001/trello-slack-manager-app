// 📁 modules/notes/NoteEditor.jsx
import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Select from "react-select";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import PresenceBars from "./PresenceBars";
import "./noteEditor.css";

export default function NoteEditor({ noteId, onClose }) {
  const socket = useSocket();
  const { user } = useAuth();

  const editorRef = useRef();
  const holderRef = useRef();
  const saveTimer = useRef();

  const [note, setNote] = useState(null);
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});

  // ================================
  // LOAD NOTE + USERS
  // ================================
  useEffect(() => {
    const load = async () => {
      const [n, u] = await Promise.all([
        request(`/notes/${noteId}`),
        request("/notes/users")
      ]);

      const formattedUsers = u.map((x) => ({
        value: x._id,
        label: x.name
      }));

      setUsers(formattedUsers);
      setNote(n);
    };

    load();
  }, [noteId]);

  // ================================
  // INIT EDITOR
  // ================================
  useEffect(() => {
    if (!note) return;

    const init = async () => {
      const editor = new EditorJS({
        holder: holderRef.current,
        data: note.content || {},
        autofocus: true,

        async onChange(api) {
          const content = await api.saver.save();

          socket?.emit("note:patch", {
            noteId,
            content,
            user: user._id
          });

          clearTimeout(saveTimer.current);
          saveTimer.current = setTimeout(() => {
            updateNote({ content });
          }, 1000);
        }
      });

      await editor.isReady;
      editorRef.current = editor;
    };

    init();

    return () => editorRef.current?.destroy();
  }, [note]);

  // ================================
  // SOCKET LISTENERS
  // ================================
  useEffect(() => {
    if (!socket) return;

    socket.emit("note:join", {
      noteId,
      user: {
        id: user._id,
        name: user.name,
        avatar: user.avatar
      }
    });

    socket.on("note:update", async ({ content, user: actor }) => {
      if (actor === user._id) return;
      await editorRef.current?.render(content);
    });

    socket.on("note:presence", setPresence);

    return () => {
      socket.emit("note:leave", noteId);
      socket.off("note:update");
      socket.off("note:presence");
    };
  }, [socket, user]);

  // ================================
  // UPDATE NOTE (FULL MODEL)
  // ================================
  const updateNote = async (changes) => {
    const updated = await request(`/notes/${noteId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...note,
        ...changes
      })
    });

    setNote(updated);
  };

  if (!note) return <div className="note-loading">Loading...</div>;

  return (
    <div className="note-editor-page">

      {/* HEADER */}
      <div className="note-editor-header">
        <button onClick={onClose}>← Back</button>

        <input
          className="note-title-input"
          value={note.title || ""}
          onChange={(e) =>
            setNote({ ...note, title: e.target.value })
          }
          onBlur={() => updateNote({ title: note.title })}
        />

        <div className="version">v{note.version}</div>
      </div>

      <PresenceBars presence={presence} />

      {/* META PANEL */}
      <div className="note-meta-panel">

        <select
          value={note.visibility}
          onChange={(e) =>
            updateNote({ visibility: e.target.value })
          }
        >
          <option value="private">Private</option>
          <option value="shared">Shared</option>
          <option value="project">Project</option>
          <option value="public">Public</option>
        </select>

        {note.visibility === "shared" && (
          <Select
            isMulti
            options={users}
            value={users.filter((u) =>
              note.sharedWith?.includes(u.value)
            )}
            onChange={(selected) =>
              updateNote({
                sharedWith: selected
                  ? selected.map((s) => s.value)
                  : []
              })
            }
          />
        )}

        <label>
          <input
            type="checkbox"
            checked={note.pinned}
            onChange={() =>
              updateNote({ pinned: !note.pinned })
            }
          />
          Pinned
        </label>

        <label>
          <input
            type="checkbox"
            checked={note.archived}
            onChange={() =>
              updateNote({ archived: !note.archived })
            }
          />
          Archived
        </label>

      </div>

      {/* EDITOR */}
      <div ref={holderRef} className="editor-holder" />

    </div>
  );
}
