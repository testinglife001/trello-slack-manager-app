// src/component/canvas/MyCanvasPageRoute.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CanvasProvider } from "../../context/CanvasContext";
import { ChannelProvider } from "../../context/ChannelContext";
import { useChannel } from "../../context/ChannelContext";
import MyCanvasPage from "./MyCanvasPage";
import CanvasRouteShell from "./CanvasRouteShell";

// Inner component so it can access ChannelContext after the provider mounts
function MyCanvasPageInner({ channelId, projectId }) {
  const { setActiveChannel } = useChannel();

  // Tell ChannelContext which channel is currently active.
  // This triggers the socket join-channel in ChannelProvider.
  useEffect(() => {
    if (channelId) setActiveChannel(channelId);
  }, [channelId]);

  return (
    <CanvasRouteShell title="My Canvas" subtitle="Advanced collaborative board workspace">
      <MyCanvasPage projectId={projectId} channelId={channelId} />
    </CanvasRouteShell>
  );
}

export default function MyCanvasPageRoute() {
  const { channelId, projectId } = useParams();

  return (
    // ChannelProvider must wrap CanvasProvider so channel socket room
    // is joined before the canvas engine tries to sync via the same socket.
    <ChannelProvider>
      <CanvasProvider>
        <MyCanvasPageInner
          channelId={channelId}
          projectId={projectId}
        />
      </CanvasProvider>
    </ChannelProvider>
  );
}





/*
// src/component/canvas/MyCanvasPageRoute.jsx
import { useParams } from "react-router-dom";
// import { ChannelProvider } from "../../context/ChannelContext";
// import { CanvasProvider } from "../../context/CanvasContext";
import MyCanvasPage from "./MyCanvasPage";
import { CanvasProvider } from "../../context/CanvasContext";
import { ChannelProvider } from "../../context/ChannelContext";
// import MyCanvasPage from "../../component/canvas/MyCanvasPage";

export default function MyCanvasPageRoute() {
  const { channelId, projectId } = useParams();

  
  const { channelId, projectId } = useParams();
  const { setActiveChannel } = useChannel();

  useEffect(() => {
    if (channelId) {
      setActiveChannel(channelId);
    }
  }, [channelId]);

  

  return (
    <ChannelProvider>
      <CanvasProvider>
        <MyCanvasPage
          projectId={projectId}
          channelId={channelId}
        />
      </CanvasProvider>
    </ChannelProvider>
  );
}
*/
