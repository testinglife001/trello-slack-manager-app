// UserActivityFeed.jsx

import { useEffect, useState } from "react";
import { request } from "../../services/api";
import ActivityFeed from "./ActivityFeed";

export default function UserActivityFeed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    request("/activity/user")
      .then(setItems);
  }, []);

  return (
    <div className="user-activity-feed mt-2">
      <ActivityFeed items={items} />
    </div>
  );
}
