// 📁 modules/canvas/VersionHistoryPanel.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../api/client";

export default function VersionHistoryPanel() {
  const { channelId } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    request(`/canvas-history/${channelId}`).then(setItems);
  }, [channelId]);

  return (
    <div className="history-panel" style={{margin:'100px 10%'}} >
      <h3>History</h3>

      {items.map(v => (
        <div key={v._id} className="history-item">
          <div>v{v.version}</div>
          <div>{v.createdBy?.name}</div>
          <div>{new Date(v.createdAt).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
