import CanvasDashboardActivity from "./CanvasDashboardActivity";

export default function CanvasActivityDashboard({ projectId, channelId, userId }) {
  return (
    <CanvasDashboardActivity
      projectId={projectId}
      channelId={channelId}
      userId={userId}
    />
  );
}
