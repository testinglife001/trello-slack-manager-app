// modules/activity/ActivityPanel.jsx
import { useEffect } from "react";
import { useActivity } from "../../context/ActivityContext";
import { useProject } from "../../context/ProjectContext";
import useActivityStream from "./useActivityStream";
import ActivityItem from "./ActivityItem";
import './activity.css'


export default function ActivityPanel() {
  // const { logs, load } = useActivity();
  // const { projectId } = useProject();

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