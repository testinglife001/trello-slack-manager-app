// 📁 modules/notes/SubtaskNotePanel.jsx
// 📁 modules/notes/SubtaskNotePanel.jsx

import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Modal from "../../components/ui/Modal";
import { request } from "../../services/api";
import Avatar from "../../components/ui/Avatar";
import "./SubtaskNoteModal.css";
import Input from "../../components/ui/Input";

export default function SubtaskNotePanel({
  subtaskId,
  onClose
}) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");

  const editorRef = useRef(null);
  const holderRef = useRef(null);

  /* ================= LOAD NOTES ================= */

  const load = async () => {
    const data = await request(
      `/cards/subtasks/${subtaskId}/notes`
    );
    setNotes(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, [subtaskId]);

  /* ================= INIT EDITOR ================= */

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
      if (editorRef.current) {
        editorRef.current.isReady
          .then(() => editorRef.current.destroy())
          .catch(() => {});
      }
    };
  }, []);

  /* ================= CREATE ================= */

  const create = async () => {
    if (!title.trim()) return;

    const content =
        await editorRef.current.saver.save();

    await request(
        `/cards/subtasks/${subtaskId}/notes`,
        {
        method: "POST",
        body: JSON.stringify({
            title,
            content
        })
        }
    );

    setTitle("");
    editorRef.current.clear();
    load();
    };


  /* ================= UI ================= */

  return (
    <Modal onClose={onClose}>

      <div className="subtask-note-modal">

        <div className="modal-header">
          <h3>Subtask Notes</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="modal-editor">

        <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <div ref={holderRef} />

        <button
            className="primary-btn"
            onClick={create}
        >
            Add Note
        </button>

        </div>


        <div className="modal-note-list">
          {notes.length === 0 && (
            <div className="empty">
              No notes yet
            </div>
          )}

          {notes.map((n) => (
            <div key={n._id} className="note-card">
              <div className="note-author">
                <Avatar src={n.author?.avatar} />
                <strong>
                  {n.author?.name}
                </strong>
              </div>
                <h4>{n.title}</h4>
              <pre>
                {JSON.stringify(
                  n.content,
                  null,
                  2
                )}
              </pre>
            </div>
          ))}
        </div>

      </div>
    </Modal>
  );
}
