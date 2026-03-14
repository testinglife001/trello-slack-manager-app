// pages/channel/ChannelPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChannelHeader from "../../modules/chat/ChannelHeader";
import MessageList from "../../modules/chat/MessageList";
import MessageInput from "../../modules/chat/MessageInput";
import TypingIndicator from "../../modules/chat/TypingIndicator";
import ThreadPanel from "../../modules/chat/ThreadPanel";
import CanvasBoard from "../../modules/canvas/CanvasBoard";
import { Sidebar as SidebarIcon, X, Maximize2, Minimize2 } from "lucide-react";
import "./channelspages.css";

const DEFAULT_CANVAS_WIDTH = 520;
const MIN_CANVAS_WIDTH = 320;
const MIN_CHAT_WIDTH = 400;

export default function ChannelPage() {
  const { channelId } = useParams();
  const [threadMsg, setThreadMsg] = useState(null);

  // ── Canvas panel state ──────────────────────────────────────────────────────
  const [canvasWidth, setCanvasWidth] = useState(
    () => Number(localStorage.getItem("canvasWidth")) || DEFAULT_CANVAS_WIDTH
  );
  const [collapsed, setCollapsed] = useState(true); // Default to collapsed for focused chat
  const [pip, setPip] = useState(false);

  const dividerRef = useRef();

  useEffect(() => {
    localStorage.setItem("canvasWidth", canvasWidth);
  }, [canvasWidth]);

  // ── Drag-to-resize divider ──────────────────────────────────────────────────
  useEffect(() => {
    const divider = dividerRef.current;
    if (!divider || collapsed || pip) return;

    const onMove = e => {
      const w = window.innerWidth - e.clientX;
      if (w < MIN_CANVAS_WIDTH || w > window.innerWidth - MIN_CHAT_WIDTH) return;
      setCanvasWidth(w);
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    const onDown = () => {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    divider.addEventListener("mousedown", onDown);
    return () => divider.removeEventListener("mousedown", onDown);
  }, [collapsed, pip]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="channel-page flex h-full overflow-hidden bg-white">

      {/* ── Chat column ── */}
      <div className="chat-column flex-1 flex flex-col min-w-0 bg-white">
        <ChannelHeader
          canvasOpen={!collapsed}
          toggleCanvas={() => setCollapsed(c => !c)}
        />
        <MessageList openThread={setThreadMsg} />
        <TypingIndicator />
        <MessageInput />
      </div>

      {/* ── Resize handle ── */}
      {!collapsed && !pip && (
        <div ref={dividerRef} className="resize-divider w-1 hover:bg-blue-400 cursor-col-resize transition-colors bg-gray-100" />
      )}

      {/* ── Canvas column (docked) ── */}
      {!pip && (
        <div
          className={`canvas-column border-l border-gray-100 flex flex-col bg-gray-50/30 transition-all duration-300 ease-in-out ${collapsed ? "w-0 opacity-0 pointer-events-none" : "opacity-100"}`}
          style={{ width: collapsed ? 0 : canvasWidth }}
        >
          {!collapsed && (
            <>
              <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <SidebarIcon size={14} />
                  Team Canvas
                </h3>
                <div className="flex items-center gap-2">
                   <button onClick={() => setPip(true)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors" title="Picture-in-picture">
                      <Maximize2 size={16} />
                   </button>
                   <button onClick={() => setCollapsed(true)} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-gray-400 transition-colors">
                      <X size={16} />
                   </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <CanvasBoard />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Picture-in-picture canvas ── */}
      {pip && (
        <div className="fixed bottom-8 right-8 w-[600px] h-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="h-12 border-b border-gray-100 flex items-center justify-between px-6 bg-gray-50 shrink-0">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Floating Canvas</span>
             <button onClick={() => setPip(false)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors">
                <Minimize2 size={16} />
             </button>
          </div>
          <div className="flex-1 overflow-hidden">
             <CanvasBoard />
          </div>
        </div>
      )}

      {/* ── Thread panel ── */}
      {threadMsg && (
        <ThreadPanel
          message={threadMsg}
          onClose={() => setThreadMsg(null)}
        />
      )}
    </div>
  );
}
