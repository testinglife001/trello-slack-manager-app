import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CanvasDashboardActivity from "./CanvasDashboardActivity";

export default function ActivityRouteRenderer() {
  const { projectId, channelId } = useParams();
  const { user } = useAuth();

  return (
    <CanvasDashboardActivity
      projectId={projectId}
      channelId={channelId}
      userId={user?._id}
    />
  );
}
