// ProjectActivityTimeline.jsx

import { useEffect, useState } from "react";
import { request } from "../../services/api";
import ActivityTimeline from "./ActivityTimeline";

export default function ProjectActivityTimeline({ projectId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    request(`/activity/project/${projectId}`)
      .then(setItems);
  }, [projectId]);

  return <ActivityTimeline items={items} />;
}
