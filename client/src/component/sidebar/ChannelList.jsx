// frontend/src/component/sidebar/ChannelList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ChannelList({ workspaceId, onSelect }) {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    axios.get(`/api/channels/project/${workspaceId}`)
      .then(res => setChannels(res.data))
      .catch(console.error);
  }, [workspaceId]);

  return (
    <div className="sidebar">
      {channels.map(c => (
        <div key={c._id} onClick={() => onSelect(c)}>
          {c.name}
        </div>
      ))}
    </div>
  );
}
