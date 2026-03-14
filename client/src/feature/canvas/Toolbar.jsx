/// canvas/Toolbar.jsx

import { useCanvas } from "../context/CanvasContext";
import './Toolbar.css';

export default function Toolbar() {
  const { tool, setTool } = useCanvas();

  const tools = [
    "select",
    "rect",
    "circle",
    "diamond",
    "line",
    "arrow",
    "pen",
    "connector",
    "text"
  ];

  return (
    <div className="toolbar">
      {tools.map(t => (
        <button
          key={t}
          className={tool===t ? "active":""}
          onClick={()=>setTool(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
