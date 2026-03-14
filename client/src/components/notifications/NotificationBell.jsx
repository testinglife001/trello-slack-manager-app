// 🔔 Bell Component
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationBell() {
  const { items } = useNotifications();

  const unread = items.filter(i => !i.read).length;

  return (
    <div className="bell">
      🔔 {unread}
    </div>
  );
}
