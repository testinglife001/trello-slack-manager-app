// modules/subtask/SubtaskList.jsx

import Input from "../../components/ui/Input";
import "./SubtaskTree.css";

export default function SubtaskList({ items = [], toggle }) {
  if (!items.length) {
    return <div className="subtask-empty">No subtasks yet</div>;
  }

  return (
    <div className="subtask-list">
      {items.map(s => (
        <div key={s._id} className="subtask">
          <Input
            type="checkbox"
            checked={s.completed}
            onChange={() => toggle(s)}
          />
          <span className={s.completed ? "done" : ""}>
            <b>{s.title}</b>
          </span>
        </div>
      ))}
    </div>
  );
}
