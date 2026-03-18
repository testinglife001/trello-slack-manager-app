import { useMemo, useRef, useState } from "react";
import { ImagePlus, Video, Type, Bold, Italic, List, Trash2 } from "lucide-react";

function exec(cmd, value = null) {
  document.execCommand(cmd, false, value);
}

export default function SocialPostEditor({ value, onChange, media = [], setMedia }) {
  const editorRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const canPreview = useMemo(() => Array.isArray(media) && media.length > 0, [media]);

  const sync = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const addFiles = async (files) => {
    const next = [];
    for (const file of files) {
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) continue;
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type: file.type.startsWith("image/") ? "image" : "video",
        name: file.name,
        url: URL.createObjectURL(file),
      });
    }
    if (next.length) setMedia((prev) => [...prev, ...next]);
  };

  return (
    <div className="social-editor">
      <div className="toolbar">
        <button type="button" onClick={() => exec("bold")}><Bold size={14} /></button>
        <button type="button" onClick={() => exec("italic")}><Italic size={14} /></button>
        <button type="button" onClick={() => exec("insertUnorderedList")}><List size={14} /></button>
        <button type="button" onClick={() => exec("formatBlock", "h2")}><Type size={14} /></button>
      </div>

      <div
        className={`editor-surface ${dragOver ? "drag-over" : ""}`}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(Array.from(e.dataTransfer.files || []));
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
      >
        <div
          ref={editorRef}
          className="editor-content"
          contentEditable
          suppressContentEditableWarning
          onInput={sync}
          dangerouslySetInnerHTML={{ __html: value || "" }}
          data-placeholder="Write rich social post copy, hooks, CTA, hashtags, scripts..."
        />

        <div className="media-helpers">
          <label>
            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addFiles(Array.from(e.target.files || []))}
            />
            <span><ImagePlus size={14} /> Add images</span>
          </label>
          <label>
            <input
              type="file"
              accept="video/*"
              multiple
              hidden
              onChange={(e) => addFiles(Array.from(e.target.files || []))}
            />
            <span><Video size={14} /> Add videos</span>
          </label>
        </div>
      </div>

      {canPreview && (
        <div className="media-preview-grid">
          {media.map((m) => (
            <div className="media-item" key={m.id}>
              {m.type === "image" ? (
                <img src={m.url} alt={m.name} />
              ) : (
                <video src={m.url} controls preload="metadata" />
              )}
              <button
                type="button"
                onClick={() => setMedia((prev) => prev.filter((x) => x.id !== m.id))}
                title="Remove media"
              >
                <Trash2 size={13} />
              </button>
              <small>{m.name}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
