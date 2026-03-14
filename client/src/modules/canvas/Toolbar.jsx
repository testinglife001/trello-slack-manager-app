// modules/canvas/Toolbar.jsx
// Toolbar.jsx
// ✅ 3️⃣ Toolbar.jsx (UPLOAD BUTTON)

import { useState } from "react";
import UploadModal from "./UploadModal";

export default function Toolbar({
  addNote,
  addText,
  upload,
  zoomIn,
  zoomOut,
  undo,
  redo
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="toolbar">
        <button onClick={addNote}>📝</button>
        <button onClick={addText}>T</button>

        {/* open modal 
        <button onClick={() => setOpen(true)}>⬆</button>*/}
        <button
          onClick={() => {
            console.log("OPEN MODAL");
            setOpen(true);
          }}
        >
          ⬆
        </button>


        <button onClick={undo}>↶</button>
        <button onClick={redo}>↷</button>

        <button onClick={zoomIn}>＋</button>
        <button onClick={zoomOut}>－</button>
      </div>

      <UploadModal
        open={open}
        onClose={() => setOpen(false)}
        onInsert={upload}
      />
    </>
  );
}


/*
export default function Toolbar({
  addNote,
  addText,
  addImage,
  addVideo,
  addDoc,
  zoomIn,
  zoomOut,
  undo,
  redo
}) {
  return (
    <div className="toolbar">
      <div className="group">
        <Tool label="Sticky" onClick={addNote}>📝</Tool>
        <Tool label="Text" onClick={addText}>T</Tool>
        <Tool label="Image" onClick={addImage}>🖼️</Tool>
        <Tool label="Video" onClick={addVideo}>🎬</Tool>
        <Tool label="File" onClick={addDoc}>📎</Tool>
      </div>

      <div className="group">
        <Tool label="Undo" onClick={undo}>↶</Tool>
        <Tool label="Redo" onClick={redo}>↷</Tool>
      </div>

      <div className="group">
        <Tool label="Zoom in" onClick={zoomIn}>＋</Tool>
        <Tool label="Zoom out" onClick={zoomOut}>－</Tool>
      </div>
    </div>
  );
}

function Tool({ children, label, ...props }) {
  return (
    <button className="tool" title={label} {...props}>
      {children}
    </button>
  );
}
*/



/*
export default function Toolbar({
  addNote,
  addText,
  addImage,
  addVideo,
  addDoc
}) {
  return (
    <div className="canvas-toolbar">
      <button onClick={addNote}>Sticky</button>
      <button onClick={addText}>Text</button>
      <button onClick={addImage}>Image</button>
      <button onClick={addVideo}>Video</button>
      <button onClick={addDoc}>File</button>
    </div>
  );
}
*/
