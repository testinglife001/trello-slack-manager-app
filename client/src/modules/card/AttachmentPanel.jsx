// modules/card/AttachmentPanel.jsx
import { useEffect, useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import './Panel.css'
import Input from "../../components/ui/Input";

export default function AttachmentPanel({ cardId }) {

  const socket = useSocket();
  const { projectId } = useProject();

  const [files, setFiles] = useState([]);

  const load = async () => {
    const data = await request(`/attachments/card/${cardId}`);
    setFiles(data);
  };

  useEffect(() => {
    load();
  }, [cardId]);

  const upload = async (e) => {
    const form = new FormData();
    form.append("file", e.target.files[0]);
    form.append("card", cardId);

    await fetch("http://localhost:5000/api/attachments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: form
    });
    socket.emit("attachment:add", { project: projectId });
    load();
    // socket.emit("attachment:add", { project: projectId });

  };

  return (
    <div>
      <h3>Attachments</h3>

      <Input type="file" onChange={upload} />

      {files.map(f => (
        <div key={f._id}>
          <a href={f.cloudUrl} target="_blank">{f.fileName}</a>
        </div>
      ))}
    </div>
  );
}
