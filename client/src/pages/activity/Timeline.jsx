// 4.2 Timeline.jsx

import { useEffect, useState } from "react";
import { request } from "../api/client";

export default function Timeline({ channelId, onSelect }) {
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    request(`/canvas-history/${channelId}`).then(setVersions);
  }, [channelId]);

  return (
    <div className="timeline">
      {versions.map(v => (
        <div key={v._id} className="timeline-node" onClick={() => onSelect(v.version)}>
          v{v.version} - {new Date(v.createdAt).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}
