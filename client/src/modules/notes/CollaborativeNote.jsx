// 🧩 1) CollaborativeNote.jsx (MAIN)
import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import { useSocket } from "../../context/SocketContext";
import { request } from "../../services/api";

export default function CollaborativeCardNote({ note }) {
  const socket = useSocket();
  const editorRef = useRef(null);
  const holderRef = useRef(null);

  const [version, setVersion] = useState(note.version);
  const [saving, setSaving] = useState(false);

  /* ================= JOIN ROOM ================= */

  useEffect(() => {
    if (!socket) return;

    socket.emit("note:join", { noteId: note._id });

    return () => {
      socket.emit("note:leave", { noteId: note._id });
    };
  }, [socket, note._id]);

  /* ================= INIT EDITOR ================= */

  useEffect(() => {
    let editor;

    const init = async () => {
      editor = new EditorJS({
        holder: holderRef.current,
        data: note.content || { blocks: [] },
        onChange: debounceSave
      });

      await editor.isReady;
      editorRef.current = editor;
    };

    init();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
      }
    };
  }, []);

  /* ================= AUTO SAVE ================= */

  const debounceSave = debounce(async () => {
    if (!editorRef.current) return;

    const content = await editorRef.current.saver.save();

    try {
      setSaving(true);

      const updated = await request(`/notes/${note._id}`, {
        method: "PUT",
        body: JSON.stringify({
          content,
          version
        })
      });

      setVersion(updated.version);

    } catch (err) {
      if (err.status === 409) {
        alert("Someone else updated this note. Reloading...");
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }

  }, 800);

  /* ================= RECEIVE REMOTE UPDATE ================= */

  useEffect(() => {
    if (!socket) return;

    socket.on("note:remote-update", async (data) => {
      if (!editorRef.current) return;

      // Ignore if local
      if (data.version <= version) return;

      await editorRef.current.render(data.content);
      setVersion(data.version);
    });

    return () => {
      socket.off("note:remote-update");
    };
  }, [socket, version]);

  return (
    <div>
      {saving && <div className="saving">Saving...</div>}
      <div ref={holderRef} />
    </div>
  );
}

/* ================= SIMPLE DEBOUNCE ================= */

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}




/*
import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
// import { request } from "../../services/api";
import useNoteSocket from "./useNoteSocket";
import PresenceBar from "./PresenceBar";
import HistoryPanel from "./HistoryPanel";
import "./collab.css";
import { request } from "../../api/client";

export default function CollaborativeNote({ noteId }) {
  const holder = useRef();
  const editorRef = useRef();
  const [note, setNote] = useState(null);

  // socket engine
  const { join, sendPatch, presence, remotePatch } =
    useNoteSocket(noteId);

  // =========================
  // LOAD NOTE
  // =========================
  useEffect(() => {
    const load = async () => {
      const data = await request(`/notes/${noteId}`);
      setNote(data);
    };
    load();
  }, [noteId]);

  // =========================
  // INIT EDITOR
  // =========================
  useEffect(() => {
    if (!note || editorRef.current) return;

    let destroyed = false;

    const editor = new EditorJS({
      holder: holder.current,
      data: note.content || {},
      async onChange(api) {
        const data = await api.saver.save();
        sendPatch(data);
      }
    });

    editor.isReady.then(() => {
      if (!destroyed) {
        editorRef.current = editor;
        join();
      }
    });

    return () => {
      destroyed = true;

      if (editorRef.current?.destroy) {
        try {
          editorRef.current.destroy();
        } catch {}
      }

      editorRef.current = null;
    };
  }, [noteId]);


  // =========================
  // APPLY REMOTE PATCH
  // =========================
  useEffect(() => {
    if (!remotePatch || !editorRef.current) return;

    editorRef.current.render(remotePatch);
  }, [remotePatch]);

  if (!note) return <div>Loading...</div>;

  return (
    <div className="collab-note">
      <PresenceBar users={presence} />
      <div ref={holder} className="editor" />
      <HistoryPanel noteId={noteId} />
    </div>
  );
}
*/
