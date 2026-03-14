// 📁 AssigneePicker.jsx
import { useEffect, useState } from "react";
import { request } from "../../services/api";
import Avatar from "../../components/ui/Avatar";
import "./assignee.css";

export default function AssigneePicker({ value = [], onChange }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await request("/projects/users");
      setUsers(Array.isArray(data) ? data : []);
    };
    load();
  }, []);

  const toggle = (u) => {
    const exists = value.some(v => v._id === u._id);

    if (exists) onChange(value.filter(v => v._id !== u._id));
    else onChange([...value, u]);
  };

  return (
    <div className="assignee-picker">
      {users.map(u => {
        const active = value.some(v => v._id === u._id);

        return (
          <div
            key={u._id}
            className={`assignee-option ${active ? "active" : ""}`}
            onClick={() => toggle(u)}
          >
            <Avatar src={u.avatar} />
            <span style={{ color: "black" }}>
              {u.username || u.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}













/*
import { useEffect, useState } from "react";
import { request } from "../../services/api";
import { useProject } from "../../context/ProjectContext";
import Avatar from "../../components/ui/Avatar";
import "./assignee.css";

export default function AssigneePicker({ value = [], onChange }) {
  const { projectId } = useProject();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await request(`/projects/${projectId}/members`);
      setUsers(data);
    };
    load();
  }, [projectId]);

  const toggle = (u) => {
    const exists = value.some(v => v._id === u._id);

    if (exists) {
      onChange(value.filter(v => v._id !== u._id));
    } else {
      onChange([...value, u]);
    }
  };

  return (
    <div className="assignee-picker">
      {users.map(u => {
        const active = value.some(v => v._id === u._id);

        return (
          <div
            key={u._id}
            className={`assignee-option ${active ? "active" : ""}`}
            onClick={() => toggle(u)}
          >
            <Avatar src={u.avatar} />
            <span style={{color:'black'}}>{u.username}</span>
          </div>
        );
      })}
    </div>
  );
}
*/
