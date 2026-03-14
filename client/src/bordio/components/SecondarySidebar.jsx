// 4️⃣ SecondarySidebar.jsx
// src/components/SecondarySidebar.jsx
import React from "react";

export default function SecondarySidebar({ items }) {
  return (
    <aside className="w-64 bg-gray-100 h-screen p-4 border-l hidden lg:block">
      <h3 className="font-bold mb-4">Details</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="bg-white p-2 rounded shadow">{item}</li>
        ))}
      </ul>
    </aside>
  );
}