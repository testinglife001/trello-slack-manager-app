// UserActivityTimeline.jsx

import { useEffect, useState } from "react";
import { request } from "../../services/api";
import ActivityTimeline from "./ActivityTimeline";

export default function UserActivityTimeline() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    request("/activity/user")
      .then(setItems);
  }, []);

  return <ActivityTimeline items={items} />;
}
