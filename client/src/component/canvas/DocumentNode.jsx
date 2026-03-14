// frontend/src/component/canvas/DocumentNode.jsx
// frontend/src/component/canvas/DocumentNode.jsx
import React, { useRef } from "react";
import { useContext } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import FilePreviewModal from "./FilePreviewModal";

export default function DocumentNode() {
  const { canvas } = useContext(CanvasContext);
  const fileInputRef = useRef(null);
  const [previewFile, setPreviewFile] = React.useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const obj = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 50,
      fill: "#fff",
      stroke: "#999",
      strokeWidth: 2,
    });

    obj.customType = "document";
    obj.file = file;
    obj.label = file.name;

    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();

    setPreviewFile(file);
  };

  return (
    <div className="floating-node document">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx,.txt"
        style={{ display: "none" }}
      />
      <button onClick={() => fileInputRef.current.click()}>Upload Document</button>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}