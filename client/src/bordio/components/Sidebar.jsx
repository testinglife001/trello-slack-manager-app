// src/bordio/components/Sidebar.jsx
// src/components/Sidebar.jsx
import React from "react";

export default function Sidebar({ activeProject, setActiveProject }) {
  const projects = [
    "Blog Post Writing",
    "Employee Training",
    "Video Recording",
    "New Website",
    "Sales Funnel",
    "Marketing campaign",
    "Mobile App",
    "CRM Integration",
    "Webinar"
  ];

  return (
    <aside className="w-64 bg-gray-50 h-screen p-4 border-r">
      <h2 className="font-bold text-xl mb-6">GIM Agency</h2>
      <div className="space-y-2">
        {projects.map((project) => (
          <button
            key={project}
            onClick={() => setActiveProject(project)}
            className={`block w-full text-left p-2 rounded hover:bg-blue-100 ${
              activeProject === project ? "bg-blue-200 font-semibold" : ""
            }`}
          >
            {project}
          </button>
        ))}
      </div>
      <button className="mt-6 w-full bg-blue-500 text-white p-2 rounded">
        + Invite people
      </button>
    </aside>
  );
}
