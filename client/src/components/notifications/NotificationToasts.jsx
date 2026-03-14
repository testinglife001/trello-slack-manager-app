// src/components/notifications/NotificationToasts.jsx
// import { useNotifications } from "../context/NotificationContext";

import { useNotifications } from "../../context/NotificationContext";

export default function NotificationToasts() {
  const { items = [] } = useNotifications();
  if (!items?.length) return null;


  return (
    <div className="toasts">
      {
      items.slice(0, 5).map(n => (
        <div key={n._id} className="toast">
          {n.type}
        </div>
      ))
      }
    </div>
  );
}
