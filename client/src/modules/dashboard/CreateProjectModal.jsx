// modules/dashboard/CreateProjectModal.jsx
import { useState } from "react";
import { request } from "../../services/api";
import Modal from "../../components/ui/Modal";
import "./createProjectModal.css";

export default function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    visibility: "private"
  });

  const submit = async (e) => {
    e.preventDefault();
    const p = await request("/projects", {
      method: "POST",
      body: JSON.stringify(form)
    });

    onCreated(p);
    onClose();
  };

  return (
    <Modal onClose={onClose} width={520}>
      <form onSubmit={submit} className="project-modal">
        {/* HEADER */}
        <div className="pm-header">
          <h2>Create project</h2>
          <p>Organize work, people and goals.</p>
        </div>

        {/* BODY */}
        <div className="pm-body">
          <label>
            Project name
            <input
              autoFocus
              placeholder="Marketing launch"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>

          <label>
            Description
            <textarea
              rows={3}
              placeholder="What is this project about?"
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

          <label>
            Visibility
            <select
              value={form.visibility}
              onChange={e =>
                setForm({ ...form, visibility: e.target.value })
              }
            >
              <option value="private">🔒 Private</option>
              <option value="public">🌍 Public</option>
            </select>
          </label>
        </div>

        {/* FOOTER */}
        <div className="pm-footer">
          <button
            type="button"
            className="ghost"
            onClick={onClose}
          >
            Cancel
          </button>

          <button className="primary">
            Create project
          </button>
        </div>
      </form>
    </Modal>
  );
}









/*
import { useState } from "react";
import { request } from "../../services/api";
import Modal from "../../components/ui/Modal";
// import Modal from "../../components/Modal";

export default function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    visibility: "private"
  });

  const submit = async (e) => {
    e.preventDefault();
    const p = await request("/projects", {
      method: "POST",
      body: JSON.stringify(form)
    });

    onCreated(p);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <form onSubmit={submit}>
        <h2>Create Project</h2>

        <input
          placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <textarea
          placeholder="Description"
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <select
          onChange={e => setForm({ ...form, visibility: e.target.value })}
        >
          <option value="private">Private</option>
          <option value="public">Public</option>
        </select>

        <button>Create</button>
      </form>
    </Modal>
  );
}
*/

