// 📁 modules/notes/CardNotePanel.jsx

import { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import { request } from "../../services/api";
import Avatar from "../../components/ui/Avatar";
import Input from "../../components/ui/Input";

export default function CardNotePanel({ cardId }) {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const editorRef = useRef(null);
  const holderRef = useRef(null);

  const load = async () => {
    const data = await request(`/cards/${cardId}/notes`);
    setNotes(data);
  };

  useEffect(() => {
    load();
  }, [cardId]);

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

  const create = async () => {
    if (!title.trim()) return;

    const content = await editorRef.current.saver.save();

    await request(`/cards/${cardId}/notes`, {
      method: "POST",
      body: JSON.stringify({
        title,
        content
      })
    });

    setTitle("");
    editorRef.current.clear();
    load();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Card Notes</h4>

      {/* TITLE INPUT */}
      <Input
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div ref={holderRef} />

      <button onClick={create}>Add Note</button>

      <div style={{ marginTop: 20 }}>
        {notes.map((n) => (
          <div key={n._id} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <Avatar src={n.author?.avatar} />
              <strong>{n.author?.name}</strong>
            </div>

            <h5 style={{ margin: "8px 0" }}>
              {n.title}
            </h5>

            <pre style={{ fontSize: 12 }}>
              {JSON.stringify(n.content, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
