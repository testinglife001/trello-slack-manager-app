// modules/activity/ActivitiesPanel.jsx
import { useProject } from "../../context/ProjectContext";
import useActivityStream from "./useActivityStream";
import ActivityItem from "./ActivityItem";

export default function ActivitiesPanel() {
  const { projectId } = useProject();
  const { logs } = useActivityStream(projectId);

  return (
    <div className="activity-panel">
      <h3>Activity</h3>

      {!logs.length && <div className="empty">No activity</div>}

      {logs.map(l => (
        <ActivityItem key={l._id} item={l} />
      ))}
    </div>
  );
}

/*
// modules/activity/ActivityPanel.jsx
import { useEffect } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useProject } from "../../context/ProjectContext";

export default function ActivityPanel() {
  const { logs, load } = useActivity();
  const { projectId } = useProject();

  useEffect(() => {
    load(projectId);
  }, [projectId]);

  return (
    <div>
      <h3>Activity</h3>
      {(logs || []).map(a => (
        <div key={a._id}>
          {a.actor?.name} → {a.type}
        </div>
      ))}
    </div>
  );
}
*/
