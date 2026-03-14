import { useParams } from "react-router-dom";
import CanvasDashboardActivity from "./CanvasDashboardActivity";

export default function CanvasDashboardWrapper() {
  const { projectId, channelId } = useParams();
  const userId = JSON.parse(localStorage.getItem("user"))?._id;

  return (
    <CanvasDashboardActivity
      projectId={projectId}
      channelId={channelId}
      userId={userId}
    />
  );
}
