import React from "react";
import { CalendarClock, CheckCircle2, ListTodo, MessageSquareText } from "lucide-react";

function StatCard({ icon, label, value, tone = "slate" }) {
  return (
    <div className={`sm-stat-card tone-${tone}`}>
      <div className="icon">{icon}</div>
      <div>
        <p>{label}</p>
        <h4>{value}</h4>
      </div>
    </div>
  );
}

const SocialHeaderStats = React.memo(function SocialHeaderStats({ stats }) {
  return (
    <div className="sm-stats-grid">
      <StatCard
        icon={<ListTodo size={16} />}
        label="Open Tasks"
        value={stats.openTasks}
        tone="blue"
      />
      <StatCard
        icon={<CalendarClock size={16} />}
        label="Scheduled Posts"
        value={stats.scheduledPosts}
        tone="indigo"
      />
      <StatCard
        icon={<CheckCircle2 size={16} />}
        label="Published"
        value={stats.publishedPosts}
        tone="emerald"
      />
      <StatCard
        icon={<MessageSquareText size={16} />}
        label="Discussion Threads"
        value={stats.discussions}
        tone="violet"
      />
    </div>
  );
});

export default SocialHeaderStats;
