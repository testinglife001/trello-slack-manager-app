import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
}

export default function NotificationBell() {
  const { items = [], unreadCount = 0, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const topItems = useMemo(() => items.slice(0, 8), [items]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 hover:bg-gray-50 rounded-xl text-gray-500 hover:text-gray-900 transition-colors"
        aria-label="Open notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl z-50">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-700">Notifications</h4>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-auto custom-scrollbar">
            {topItems.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications yet</p>
            ) : (
              topItems.map((item) => {
                const isRead = !!item.isRead;
                return (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => markRead(item._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition ${
                      isRead ? "bg-white" : "bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {item.actor?.name || "System"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.meta?.title || item.type || "Notification"}
                        </p>
                      </div>
                      {!isRead && <span className="w-2 h-2 mt-1 rounded-full bg-blue-500" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{formatTime(item.createdAt)}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
