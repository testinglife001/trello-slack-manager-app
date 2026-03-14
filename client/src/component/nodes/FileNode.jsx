// component/nodes/FileNode.jsx
import React, { useState } from "react";
import FileModal from "./FileModal";

export default function FileNode({ meta }) {
  const [open, setOpen] = useState(false);

  const renderPreview = () => {
    const type = meta.type;

    if (type.startsWith("image"))
      return <img src={meta.url} width="100%" />;

    if (type.startsWith("video"))
      return <video src={meta.url} width="100%" controls />;

    if (type === "application/pdf")
      return <iframe src={meta.url} width="100%" height="120" />;

    return <div>📄 {meta.name}</div>;
  };

  return (
    <>
      <div onClick={() => setOpen(true)} className="file-node">
        {renderPreview()}
      </div>

      {open && <FileModal meta={meta} onClose={()=>setOpen(false)} />}
    </>
  );
}
