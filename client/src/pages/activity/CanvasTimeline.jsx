// CanvasTimeline.jsx (Visual Timeline + Highlights)
import { useEffect, useState } from "react";
import { request } from "../api/client";

export default function CanvasTimeline({ channelId }) {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    request(`/canvas-history/${channelId}`).then(setVersions);
  }, [channelId]);

  return (
    <div className="canvas-timeline">
      <h4>Canvas Timeline</h4>
      {versions.map(v => (
        <div key={v._id} className="timeline-item">
          v{v.version} by {v.createdBy?.name} at {new Date(v.createdAt).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}