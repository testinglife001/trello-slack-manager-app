// modules/card/DescriptionEditor.jsx
// modules/subtask/SubtaskTree.jsx
// 1️⃣ SubtaskTree.jsx (controller)
// modules/subtask/SubtaskTree.jsx
import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { request } from "../../services/api";
import "./Editor.css";

export default function DescriptionEditor({ card }) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!card?._id) return;
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      data: card.description || {},
      async onChange(api) {
        const data = await api.saver.save();
        await request(`/cards/${card._id}`, {
          method: "PUT",
          body: JSON.stringify({ description: data })
        });
      }
    });

    editor.isReady
      .then(() => {
        editorRef.current = editor;
      })
      .catch(() => {});

    return () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
      }
      editorRef.current = null;
    };
  }, [card?._id]);

  return (
    <div>
      <h3>Description</h3>
      <div ref={holderRef} className="editor" />
    </div>
  );
}




/*
import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { request } from "../../services/api";
import "./Editor.css";

export default function DescriptionEditor({ card }) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) return;

    let destroyed = false;

    const editor = new EditorJS({
      holder: holderRef.current,
      data: card.description || {},
      async onChange(api) {
        const data = await api.saver.save();
        await request(`/cards/${card._id}`, {
          method: "PUT",
          body: JSON.stringify({ description: data }),
        });
      },
    });

    editor.isReady.then(() => {
      if (!destroyed) editorRef.current = editor;
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
  }, [card._id]);

  return (
    <div>
      <h3>Description</h3>
      <div ref={holderRef} className="editor" />
    </div>
  );
}
*/







/*
import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
import { request } from "../../services/api";
import './Editor.css'

export default function DescriptionEditor({ card, reload }) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    let editor;
    let mounted = true;

    const init = async () => {
      editor = new EditorJS({
        holder: holderRef.current,
        data: card.description || {},
        async onChange(api) {
          const data = await api.saver.save();
          await request(`/cards/${card._id}`, {
            method: "PUT",
            body: JSON.stringify({ description: data })
          });
        }
      });

      await editor.isReady;

      if (mounted) {
        editorRef.current = editor;
      }
    };

    init();

    return () => {
      mounted = false;

      if (editor && typeof editor.destroy === "function") {
        editor.destroy();
      }

      editorRef.current = null;
    };
  }, [card._id]);


  return (  
    <div>
      <h3>Description</h3>
      <div className="editor" ref={holderRef}></div>
    </div>
  );
}
*/
