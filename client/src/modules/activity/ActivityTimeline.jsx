// ActivityTimeline.jsx

import dayjs from "dayjs";

export default function ActivityTimeline({ items }) {
  const grouped = {};

  items.forEach(a => {
    const key = dayjs(a.createdAt).format("YYYY-MM-DD");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  return (
    <div className="timeline">
      {Object.entries(grouped).map(([date, acts]) => (
        <div key={date}>
          <h4>{dayjs(date).format("MMMM D, YYYY")}</h4>

          {acts.map(a => (
            <div key={a._id} className="timeline-item">
              <img src={a.actor?.avatar} width="24" />
              <span>
                <b>{a.actor?.name}</b> {a.action} {a.entityType}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
