// src/component/canvas/MyCanvasPageExIRoute.jsx
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { CanvasProvider } from "../../context/CanvasContext";
import { ChannelProvider } from "../../context/ChannelContext";
import { useChannel } from "../../context/ChannelContext";
import MyCanvasPageExI from "./MyCanvasPageExI";


// Inner component so it can access ChannelContext after the provider mounts
function MyCanvasPageExInner({ channelId, projectId }) {
  const { setActiveChannel } = useChannel();

  // Tell ChannelContext which channel is currently active.
  // This triggers the socket join-channel in ChannelProvider.
  useEffect(() => {
    if (channelId) setActiveChannel(channelId);
  }, [channelId]);

  return (
    <MyCanvasPageExI
       projectId={projectId}
      channelId={channelId}
    />
  );
}

export default function MyCanvasPageExIRoute() {
  const { channelId, projectId } = useParams();

  return (
    // ChannelProvider must wrap CanvasProvider so channel socket room
    // is joined before the canvas engine tries to sync via the same socket.
    <ChannelProvider>
      <CanvasProvider>
        <MyCanvasPageExInner
          channelId={channelId}
          projectId={projectId}
        />
      </CanvasProvider>
    </ChannelProvider>
  );
}

