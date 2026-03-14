// 📁 AssigneeAvatarStack.jsx
// Shows selected users.

import Avatar from "../../components/ui/Avatar";
import "./assignee.css";

export default function AssigneeAvatarStack({ users = [], remove }) {
  if (!users.length) return null;

  return (
    <div className="assignee-stack">
      {users.map(u => (
        <div key={u._id} className="assignee-item">
          <Avatar src={u.avatar} />
          <span style={{color:'black'}}>{u.username}</span>

          {remove && (
            <button onClick={() => remove(u)}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
}
