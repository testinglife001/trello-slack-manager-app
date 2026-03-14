// ✅ FINAL – CanvasHeader.jsx
import { useNavigate, useParams } from "react-router-dom";
import './CanvasHeader.css';

export default function CanvasHeader({ users, title }) {
  const navigate = useNavigate();
  const { projectId, channelId } = useParams();

  const backToChat = () => {
    navigate(`/projects/${projectId}/channels/${channelId}`);
  };

  return (
    <div className="canvas-header">
      <div className="canvas-header-left">
        {/* ✅ back */}
        <button className="back-to-chat" onClick={backToChat}>
          ← Back to Chat
        </button>

        <b>{title}</b>
      </div>

      <div className="avatars">
        {users.map(u => (
          <div key={u.user.id} className="avatar">
            {u.user.name[0]}
          </div>
        ))}
      </div>
    </div>
  );
}
