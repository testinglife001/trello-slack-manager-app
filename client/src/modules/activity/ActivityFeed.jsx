import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Circle, User } from "lucide-react";

dayjs.extend(relativeTime);

const formatText = (a) => {
  if (a.entityType === "card" && a.action === "created")
    return `created card "${a.meta?.title || 'Untitled Card'}"`;

  if (a.entityType === "card" && a.action === "updated")
    return `updated card "${a.meta?.title || 'Untitled Card'}"`;

  if (a.entityType === "note")
    return `${a.action} note "${a.meta?.title || 'Untitled Note'}"`;

  return `${a.action} ${a.entityType}`;
};

export default function ActivityFeed({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <Circle size={24} className="mb-2 opacity-20" />
        <p className="text-xs font-medium">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((a, idx) => (
        <div key={a._id || idx} className="flex gap-4 group cursor-default">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0 z-10 relative">
              {a.actor?.avatar ? (
                <img src={a.actor.avatar} alt={a.actor.name} className="w-full h-full object-cover" />
              ) : (
                <User size={18} className="text-blue-600" />
              )}
            </div>
            {idx !== items.length - 1 && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-full bg-gray-100 group-last:hidden" />
            )}
          </div>
          
          <div className="flex-1 pt-0.5 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-gray-900">{a.actor?.name || "Someone"}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {dayjs(a.createdAt).fromNow()}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              {formatText(a)}
            </p>
            {a.data?.content && (
              <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 italic line-clamp-2">
                "{a.data.content}"
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
