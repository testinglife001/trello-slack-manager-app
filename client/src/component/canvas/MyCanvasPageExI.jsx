// src/pages/canvas/MyCanvasPageExI.jsx

import React,
{
useEffect,
useRef,
useState,
useCallback,
useContext
} from "react";

import { fabric } from "fabric";
import { request } from "../../api/client";

import { useParams } from "react-router-dom";

import LayerPanel from "./LayerPanel";
import TimelinePlayer from "./TimelinePlayer";


import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

import { useCanvasEngine } from "./engine/useCanvasEngine";
import { setupInfiniteTiling } from "./engine/infiniteRenderer";
import { playTimeline } from "./engine/timelineEngine";

import CanvasToolbar from "./CanvasToolbar";
import FloatingLayer from "./FloatingLayer";
import NodePropertiesPanel from "./NodePropertiesPanel";

import MiniMap from "./MiniMap";
import MiniMapLive from "./MiniMapLive";
import MiniMapTimeline from "./MiniMapTimeline";
import ZoomControls from "./ZoomControls";

import CanvasVideoOverlay from "./CanvasVideoOverlay";
import CollaborativeCursors from "./CollaborativeCursors";

import FilePreviewModal from "./FilePreviewModal";
import CommandPalette from "./CommandPalette";

import {
connectNodes
} from "../../utils/connector";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";

export default function MyCanvasPageExI({ channelId: channelIdProp }) {

const canvasRef = useRef(null);
const fabricRef = useRef(null);

const { channelId: param } = useParams();
const channelId = channelIdProp || param;

const roomId = channelId || "demo-room";

const socket = useSocket();
const { user } = useAuth();

const { canvas } = useContext(CanvasContext);

useCanvasEngine(roomId, canvas, socket);

const [snapshots,setSnapshots] = useState([]);
const [canvasReady,setCanvasReady] = useState(false);

const [leftTab,setLeftTab] = useState("tools");
const [rightTab,setRightTab] = useState("properties");

const [commandOpen,setCommandOpen] = useState(false);
const [previewFile,setPreviewFile] = useState(null);

const [contextMenu,setContextMenu] = useState(null);



/* ---------- Fabric Init ---------- */

useEffect(()=>{

const fabricCanvas = new fabric.Canvas(canvasRef.current,{
backgroundColor:"#fff",
preserveObjectStacking:true
});

fabricCanvas.setWidth(window.innerWidth*2);
fabricCanvas.setHeight(window.innerHeight*2);

fabricRef.current = fabricCanvas;

setupInfiniteTiling(fabricCanvas);

setCanvasReady(true);

return ()=>fabricCanvas.dispose()

},[]);



/* ---------- Snapshot Load ---------- */

useEffect(()=>{

if(!roomId) return;

(async ()=>{

const data = await request(`/mycanvas/snapshots/${roomId}`);
setSnapshots(data || []);

})();

},[roomId]);



/* ---------- Restore Snapshot ---------- */

const restoreSnapshot = snap => {

if(!fabricRef.current) return;

fabricRef.current.loadFromJSON(
snap.fabricJson,
()=>fabricRef.current.renderAll()
);

};



/* ---------- Timeline Playback ---------- */

const playHistory = ()=>{

playTimeline(fabricRef.current,snapshots,2);

};



/* ---------- Node Helpers ---------- */

const addTextNode = ()=>{

const node = createTextNode("Hello");
node.set({ left:100, top:100 });

fabricRef.current.add(node);

};



/* ---------- Context Menu ---------- */

useEffect(()=>{

const canvas = fabricRef.current;

if(!canvas) return;

canvas.on("mouse:down",opt=>{

if(opt.e.button===2){

setContextMenu({
x:opt.e.clientX,
y:opt.e.clientY,
object:opt.target
});

}

});

},[]);



/* ---------- Command Palette ---------- */

useEffect(()=>{

const handler=e=>{

if(e.ctrlKey && e.key==="k"){
e.preventDefault();
setCommandOpen(true);
}

};

window.addEventListener("keydown",handler);

return ()=>window.removeEventListener("keydown",handler);

},[]);



/* ---------- UI ---------- */

return (

<div className="canvas-layout">

<div className="canvas-header">

<div>Room: {roomId}</div>

<div>

<button onClick={()=>fabricRef.current?.undo?.()}>Undo</button>
<button onClick={()=>fabricRef.current?.redo?.()}>Redo</button>
<button onClick={playHistory}>Play</button>

</div>

</div>



<div className="canvas-body">

<div className="sidebar left">

<div className="sidebar-tabs">

<button onClick={()=>setLeftTab("tools")}>Tools</button>
<button onClick={()=>setLeftTab("nodes")}>Nodes</button>
<button onClick={()=>setLeftTab("layers")}>Layers</button>
<button onClick={()=>setLeftTab("timeline")}>Timeline</button>

</div>

<div className="sidebar-content">

{leftTab==="tools" && <CanvasToolbar/>}
{leftTab==="nodes" && <FloatingLayer/>}

{leftTab==="layers" &&

<LayerPanel
canvas={fabricRef.current}
snapshots={snapshots}
restoreSnapshot={restoreSnapshot}
/>
}

{leftTab==="timeline" &&

<TimelinePlayer
canvas={fabricRef.current}
snapshots={snapshots}
/>

}

</div>

</div>



<div className="canvas-wrapper">

<canvas ref={canvasRef}/>

{canvasReady && (

<>

<MiniMap/>
<MiniMapLive/>
<MiniMapTimeline/>
<ZoomControls/>

<CanvasVideoOverlay canvas={fabricRef.current}/>

{socket && <CollaborativeCursors socket={socket}/>}

</>

)}

</div>



<div className="sidebar right">

<div className="sidebar-tabs">

<button onClick={()=>setRightTab("properties")}>Properties</button>
<button onClick={()=>setRightTab("zoom")}>Zoom</button>
<button onClick={()=>setRightTab("minimap")}>Minimap</button>

</div>

<div className="sidebar-content">

{rightTab==="properties" &&
<NodePropertiesPanel canvas={fabricRef.current}/>
}

{rightTab==="zoom" && <ZoomControls/>}
{rightTab==="minimap" && <MiniMap/>}

</div>

</div>

</div>



{contextMenu && (

<div
className="context-menu"
style={{top:contextMenu.y,left:contextMenu.x}}
>

<div onClick={()=>contextMenu.object?.bringToFront()}>
Bring Front
</div>

<div onClick={()=>contextMenu.object?.sendToBack()}>
Send Back
</div>

<div onClick={()=>{

fabricRef.current.remove(contextMenu.object);
setContextMenu(null);

}}>
Delete
</div>

</div>

)}



<FilePreviewModal
file={previewFile}
open={!!previewFile}
onClose={()=>setPreviewFile(null)}
/>



<CommandPalette
open={commandOpen}
onClose={()=>setCommandOpen(false)}
canvas={fabricRef.current}
addTextNode={addTextNode}
/>

</div>

)

}