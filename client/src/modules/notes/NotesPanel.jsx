// modules/notes/NotesPanel.jsx
import { useEffect, useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import './Panel.css'
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function NotesPanel({ cardId }) {
  const socket = useSocket();
  const { projectId } = useProject();
  
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  const load = async () => {
    try {
        const data = await request(`/notes?linkedCard=${cardId}`);
        setNotes(Array.isArray(data) ? data : []);
    } catch {
        setNotes([]);
    }
  };



  useEffect(() => {
    load();
  }, [cardId]);

  const create = async () => {
    
    // await request(`/cards/${cardId}/notes`, {
    //  method: "POST",
    //  body: JSON.stringify({ content: text })
    // });
    await request("/notes", {
        method: "POST",
        body: JSON.stringify({
            content: text,
            linkedCard: cardId
        })
    });

    setText("");
    socket.emit("note:create", { project: projectId });

    load();
  };

  return (
    <div>
      <h3>Notes</h3>

      {(notes || []).map(n => (
        <div key={n._id}>{n.content}</div>
      ))}


      <Input
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <Button onClick={create}>Add</Button>
    </div>
  );
}
