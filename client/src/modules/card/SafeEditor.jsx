// ✅ SAFE EditorJS Pattern (StrictMode Proof)
// SafeEditor.jsx
import { useEffect, useRef } from "react";
import EditorJS from "@editorjs/editorjs";

export default function SafeEditor({ data, onChange }) {
  const holderRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) return; // 🚀 prevent double init

    let destroyed = false;

    const editor = new EditorJS({
      holder: holderRef.current,
      data: data || {},
      async onChange(api) {
        const content = await api.saver.save();
        onChange?.(content);
      }
    });

    editor.isReady
      .then(() => {
        if (!destroyed) {
          editorRef.current = editor;
        }
      })
      .catch(() => {});

    return () => {
      destroyed = true;

      if (editorRef.current?.destroy) {
        try {
          editorRef.current.destroy();
        } catch {}
      }

      editorRef.current = null;
    };
  }, []);

  return <div ref={holderRef} className="editor" />;
}
