// frontend/src/component/canvas/FileNode.jsx
// frontend/src/component/canvas/FileNode.jsx
import React, { useRef } from "react";
import { useContext } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import FilePreviewModal from "./FilePreviewModal";

export default function FileNode() {
  const { canvas } = useContext(CanvasContext);
  const fileInputRef = useRef(null);
  const [previewFile, setPreviewFile] = React.useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const url = URL.createObjectURL(file);

    let obj;
    if (file.type.startsWith("image/")) {
      const img = new fabric.Image.fromURL(url, (imgObj) => {
        imgObj.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
        canvas.add(imgObj);
        canvas.setActiveObject(imgObj);
        canvas.requestRenderAll();
      });
      obj = img;
    } else if (file.type.startsWith("video/")) {
      obj = new fabric.Rect({
        left: 100,
        top: 100,
        width: 300,
        height: 200,
        fill: "#000",
      });
      obj.customType = "video";
      obj.videoUrl = url;
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    } else {
      // For PDF, DOC/DOCX, text, show as file icon
      obj = new fabric.Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 50,
        fill: "#f0f0f0",
        stroke: "#ccc",
      });
      obj.customType = "file";
      obj.file = file;
      obj.label = file.name;
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    }

    setPreviewFile(file);
  };

  return (
    <div className="floating-node file">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button onClick={() => fileInputRef.current.click()}>Upload File</button>

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
