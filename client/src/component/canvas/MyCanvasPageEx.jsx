// src/pages/canvas/MyCanvasPageEx.jsx
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

// import LayerPanel from "../../components/canvas/LayerPanel";
// import TimelinePlayer from "../../components/canvas/TimelinePlayer";

import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useCanvasEngine } from "./engine/useCanvasEngine";

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
import LayerPanels from "./LayerPanels";
import TimelinePlayer from "./TimelinePlayer";

export default function MyCanvasPageEx({ channelId: channelIdProp }) {

const canvasRef = useRef(null);
const fabricRef = useRef(null);

const { channelId: channelIdParam } = useParams();
const channelId = channelIdProp || channelIdParam;

const roomId = channelId || "demo-room";

const socket = useSocket();
const { user } = useAuth();

const { canvas, nodes } = useContext(CanvasContext);

useCanvasEngine(roomId);

const [room,setRoom] = useState(null);
const [boards,setBoards] = useState([]);
const [activeBoard,setActiveBoard] = useState(null);
const [snapshots,setSnapshots] = useState([]);

const [canvasReady,setCanvasReady] = useState(false);
const [tool,setTool] = useState("select");
const [noteText,setNoteText] = useState("");

const [leftTab,setLeftTab] = useState("tools");
const [rightTab,setRightTab] = useState("properties");

const [contextMenu,setContextMenu] = useState(null);
const [commandOpen,setCommandOpen] = useState(false);
const [previewFile,setPreviewFile] = useState(null);




/* -------------------- FABRIC INITIALIZATION -------------------- */

useEffect(()=>{

const fabricCanvas = new fabric.Canvas(canvasRef.current,{
backgroundColor:"#ffffff",
preserveObjectStacking:true,
selection:true
});

fabricCanvas.setWidth(window.innerWidth*2);
fabricCanvas.setHeight(window.innerHeight*2);

fabricRef.current = fabricCanvas;

return ()=>fabricCanvas.dispose()

},[]);



/* -------------------- INFINITE CANVAS PAN + ZOOM -------------------- */

useEffect(()=>{

if(!fabricRef.current) return;

const canvas = fabricRef.current;

let panning = false;

canvas.on("mouse:down",(opt)=>{
if(opt.e.altKey){
panning=true
}
})

canvas.on("mouse:move",(opt)=>{
if(!panning) return

const e = opt.e
const vpt = canvas.viewportTransform

vpt[4]+=e.movementX
vpt[5]+=e.movementY

canvas.requestRenderAll()
})

canvas.on("mouse:up",()=>panning=false)

canvas.on("mouse:wheel",(opt)=>{

const delta = opt.e.deltaY
let zoom = canvas.getZoom()

zoom*=0.999 ** delta

zoom=Math.min(5,Math.max(0.2,zoom))

canvas.zoomToPoint(
{ x:opt.e.offsetX,y:opt.e.offsetY },
zoom
)

opt.e.preventDefault()
opt.e.stopPropagation()

})

},[]);



/* -------------------- ROOM + BOARD LOADING -------------------- */

useEffect(()=>{

if(!channelId) return

const init = async()=>{

try{

const roomData = await request(`/mycanvas/room/${channelId}`)
setRoom(roomData)

const boardsData = await request(`/mycanvas/boards/${roomData._id}`)
setBoards(boardsData)

if(boardsData?.length){
setActiveBoard(boardsData[0])
}

socket?.emit("join-room",roomData._id)

}catch(err){
console.error(err)
}

}

init()

},[channelId])



/* -------------------- BOARD DATA LOAD -------------------- */

useEffect(()=>{

if(!canvas || !activeBoard) return

if(activeBoard.fabricJson){

canvas.loadFromJSON(activeBoard.fabricJson,()=>{
canvas.renderAll()
})

}

},[canvas,activeBoard])



/* -------------------- SNAPSHOT LOAD -------------------- */

useEffect(()=>{

if(!activeBoard) return

const loadSnapshots = async()=>{

const data = await request(`/mycanvas/snapshots/${activeBoard._id}`)
setSnapshots(data||[])

}

loadSnapshots()

},[activeBoard])



/* -------------------- SNAPSHOT RESTORE -------------------- */

const restoreSnapshot = (snapshot)=>{

if(!canvas || !snapshot.fabricJson) return

canvas.loadFromJSON(snapshot.fabricJson,()=>{
canvas.renderAll()
})

}



/* -------------------- AUTOSAVE -------------------- */

useEffect(()=>{

if(!canvas || !activeBoard || !room) return

const saveState = async()=>{

const json = canvas.toJSON()

await request(`/mycanvas/board/${activeBoard._id}`,{
method:"PUT",
body:JSON.stringify({fabricJson:json})
})

await request(`/mycanvas/activity`,{
method:"POST",
body:JSON.stringify({
roomId:room._id,
boardId:activeBoard._id,
action:"canvas_saved"
})
})

}

const interval = setInterval(saveState,15000)

return ()=>clearInterval(interval)

},[canvas,activeBoard,room])



/* -------------------- REALTIME SYNC -------------------- */

useEffect(()=>{

if(!socket || !canvas) return

socket.on("remote-update",(payload)=>{

canvas.loadFromJSON(payload,()=>{
canvas.renderAll()
})

})

return ()=>socket.off("remote-update")

},[socket,canvas])



/* -------------------- BROADCAST CHANGES -------------------- */

useEffect(()=>{

if(!canvas || !room) return

const broadcast = ()=>{

const json = canvas.toJSON()

socket.emit("canvas-update",{
canvasId:room._id,
payload:json
})

}

canvas.on("object:added",broadcast)
canvas.on("object:modified",broadcast)
canvas.on("object:removed",broadcast)

return ()=>{
canvas.off("object:added",broadcast)
canvas.off("object:modified",broadcast)
canvas.off("object:removed",broadcast)
}

},[canvas,room])



/* -------------------- SMART SNAPPING -------------------- */

useEffect(()=>{

if(!canvas) return

canvas.on("object:moving",(e)=>{

const obj = e.target

canvas.forEachObject((snap)=>{

if(snap===obj) return

if(Math.abs(obj.left - snap.left)<10){
obj.left = snap.left
}

if(Math.abs(obj.top - snap.top)<10){
obj.top = snap.top
}

})

})

},[canvas])



/* -------------------- CANVAS READY -------------------- */

useEffect(()=>{
if(canvas) setCanvasReady(true)
},[canvas])



/* -------------------- NODE ADD HELPERS -------------------- */

const addToCanvas = useCallback((obj)=>{

if(!canvas) return

obj.id = obj.id || Date.now().toString()

canvas.add(obj)
canvas.setActiveObject(obj)
canvas.requestRenderAll()

},[canvas])



const addTextNode = ()=>{
const node = createTextNode("Hello World")
node.set({left:100,top:100})
addToCanvas(node)
}

const addParagraphNode = ()=>{
const node = createTextNode("Paragraph text")
node.set({left:300,top:100,width:200})
addToCanvas(node)
}

const addChecklistNode = ()=>{
const node = createTextNode("- [ ] item")
node.set({left:100,top:250})
addToCanvas(node)
}

const addImageNode = async(url)=>{
const img = await createImageNode(url)
img.set({left:200,top:150})
addToCanvas(img)
}

const addTaskCardNode = ()=>{
const node = createTaskCardNode("Task")
node.set({left:200,top:400})
addToCanvas(node)
}



/* -------------------- COMMAND PALETTE -------------------- */

useEffect(()=>{

const handler=(e)=>{

if(e.ctrlKey && e.key==="k"){
e.preventDefault()
setCommandOpen(true)
}

}

window.addEventListener("keydown",handler)
return ()=>window.removeEventListener("keydown",handler)

},[])



/* -------------------- CONTEXT MENU -------------------- */

useEffect(()=>{

if(!canvas) return

const handler=(opt)=>{

if(opt.e.button===2){

opt.e.preventDefault()

setContextMenu({
x:opt.e.clientX,
y:opt.e.clientY,
object:opt.target
})

}

}

canvas.on("mouse:down",handler)
return ()=>canvas.off("mouse:down",handler)

},[canvas])



/* -------------------- UI -------------------- */

return (

<div className="canvas-layout">

<div className="canvas-header">

<div>Room: {roomId}</div>

<div>
<button onClick={()=>canvas?.undo?.()}>Undo</button>
<button onClick={()=>canvas?.redo?.()}>Redo</button>
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

<LayerPanels
canvas={canvas}
snapshots={snapshots}
restoreSnapshot={restoreSnapshot}
/>
}

{leftTab==="timeline" &&
<TimelinePlayer canvas={canvas} snapshots={snapshots}/>
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

<CanvasVideoOverlay canvas={canvas}/>

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

{rightTab==="properties" && <NodePropertiesPanel canvas={canvas}/>}
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

<div onClick={()=>contextMenu.object?.bringToFront()}>Bring Front</div>
<div onClick={()=>contextMenu.object?.sendToBack()}>Send Back</div>

<div onClick={()=>{

canvas.remove(contextMenu.object)
setContextMenu(null)

}}>Delete</div>

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
canvas={canvas}
addTextNode={addTextNode}
/>

</div>

)

}







/*
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { request } from "../../api/client";
import LayerPanel from "../../components/canvas/LayerPanel";
import TimelinePlayer from "../../components/canvas/TimelinePlayer";

export default function MyCanvasPageEx({ channelId, socket }) {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  // const [canvas, setCanvas] = useState(null);

  const [room, setRoom] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  // const [leftTab, setLeftTab] = useState("layers");


  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      preserveObjectStacking: true
    });

    fabricRef.current = fabricCanvas;
    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);


  useEffect(() => {
    if (!channelId) return;

    const init = async () => {
      try {
        const roomData = await request(`/mycanvas/room/${channelId}`);
        setRoom(roomData);

        const boardsData = await request(`/mycanvas/boards/${roomData._id}`);
        setBoards(boardsData);

        if (boardsData?.length) {
          setActiveBoard(boardsData[0]);
        }

        socket?.emit("join-room", roomData._id);

      } catch (err) {
        console.error("Canvas init error", err);
      }
    };

    init();
  }, [channelId]);

 

  useEffect(() => {
    if (!canvas || !activeBoard) return;

    if (activeBoard.fabricJson) {
      canvas.loadFromJSON(activeBoard.fabricJson, () => {
        canvas.renderAll();
      });
    }

  }, [canvas, activeBoard]);



  useEffect(() => {
    if (!activeBoard) return;

    const loadSnapshots = async () => {
      try {
        const data = await request(`/mycanvas/snapshots/${activeBoard._id}`);
        setSnapshots(data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadSnapshots();

  }, [activeBoard]);

  

  const restoreSnapshot = (snapshot) => {
    if (!canvas || !snapshot.fabricJson) return;

    canvas.loadFromJSON(snapshot.fabricJson, () => {
      canvas.renderAll();
    });
  };

 
  useEffect(() => {
    if (!canvas || !activeBoard || !room) return;

    const saveState = async () => {
      try {
        const json = canvas.toJSON();

        await request(`/mycanvas/board/${activeBoard._id}`, {
          method: "PUT",
          body: JSON.stringify({ fabricJson: json })
        });

        await request(`/mycanvas/activity`, {
          method: "POST",
          body: JSON.stringify({
            roomId: room._id,
            boardId: activeBoard._id,
            action: "canvas_saved"
          })
        });

      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(saveState, 15000);

    return () => clearInterval(interval);

  }, [canvas, activeBoard, room]);



  useEffect(() => {
    if (!socket || !canvas) return;

    socket.on("remote-update", (payload) => {
      canvas.loadFromJSON(payload, () => {
        canvas.renderAll();
      });
    });

    return () => socket.off("remote-update");

  }, [socket, canvas]);

  

  useEffect(() => {
    if (!canvas || !room) return;

    const broadcast = () => {
      const json = canvas.toJSON();

      socket?.emit("canvas-update", {
        canvasId: room._id,
        payload: json
      });
    };

    canvas.on("object:added", broadcast);
    canvas.on("object:modified", broadcast);
    canvas.on("object:removed", broadcast);

    return () => {
      canvas.off("object:added", broadcast);
      canvas.off("object:modified", broadcast);
      canvas.off("object:removed", broadcast);
    };

  }, [canvas, room]);

  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;
  const roomId = channelId || "demo-room";

  const { canvas, nodes } = useContext(CanvasContext);
  const  socket  = useSocket();
  const { user } = useAuth();

  useCanvasEngine(roomId);

  
  const [canvasReady, setCanvasReady] = useState(false);
  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");

  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("properties");

  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

 
  useEffect(() => {
    if (canvas) setCanvasReady(true);
  }, [canvas]);


  const addToCanvas = useCallback((obj) => {
    if (!canvas) return;
    obj.id = obj.id || Date.now().toString();
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }, [canvas]);


  const addTextNode = () => {
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    addToCanvas(node);
  };

  const addParagraphNode = () => {
    const node = createTextNode(
      "This is a paragraph.\nYou can edit it."
    );
    node.set({ left: 300, top: 100, width: 200 });
    addToCanvas(node);
  };

  const addChecklistNode = () => {
    const node = createTextNode("- [ ] Item 1\n- [ ] Item 2");
    node.set({ left: 100, top: 250 });
    addToCanvas(node);
  };

  const addImageNode = async (url) => {
    const img = await createImageNode(url);
    img.set({ left: 200, top: 150 });
    addToCanvas(img);
  };

  const addTaskCardNode = () => {
    const node = createTaskCardNode("Task Card");
    node.set({ left: 200, top: 400 });
    addToCanvas(node);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText);
    note.set({ left: 150, top: 500 });
    addToCanvas(note);
    setNoteText("");
  };

  const addConnector = () => {
    if (nodes?.length >= 2) {
      connectNodes(canvas, nodes[nodes.length-2], nodes[nodes.length-1]);
    }
  };


  useEffect(() => {
    if (!canvas) return;

    const handler = (opt) => {
      if (opt.e.button === 2) {
        opt.e.preventDefault();
        setContextMenu({
          x: opt.e.clientX,
          y: opt.e.clientY,
          object: opt.target,
        });
      }
    };

    canvas.on("mouse:down", handler);
    return () => canvas.off("mouse:down", handler);
  }, [canvas]);


  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);



  return (
    <div>
    <div className="canvas-layout">

    
      <div className="canvas-header">
        <div>Room: {roomId}</div>
        <div>
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
        </div>
      </div>

   
      <div className="canvas-body">

      
        <div className="sidebar left">

          <div className="sidebar-tabs">
            <button
              className={leftTab === "tools" ? "active" : ""}
              onClick={() => setLeftTab("tools")}
            >Tools</button>

            <button
              className={leftTab === "nodes" ? "active" : ""}
              onClick={() => setLeftTab("nodes")}
            >Nodes</button>

            <button
            className={`flex-1 p-2 ${leftTab === "layers" ? "bg-white" : ""}`}
            onClick={() => setLeftTab("layers")}
          >
            Layers
          </button>

          <button
            className={`flex-1 p-2 ${leftTab === "timeline" ? "bg-white" : ""}`}
            onClick={() => setLeftTab("timeline")}
          >
            Timeline
          </button>

        </div>
          </div>

          <div className="sidebar-content">
            {leftTab === "tools" && <CanvasToolbar />}
            {leftTab === "nodes" && <FloatingLayer />}
            {leftTab === "layers" && <LayerPanel />}
            {leftTab === "layers" && (
            <LayerPanel
                canvas={canvas}
                snapshots={snapshots}
                restoreSnapshot={restoreSnapshot}
              />
            )}

            {leftTab === "timeline" && (
              <TimelinePlayer
                canvas={canvas}
                snapshots={snapshots}
              />
            )}
          </div>
        </div>


        <div
          className="canvas-wrapper"
          onDragOver={(e) => e.preventDefault()}
        >
          <canvas id="canvas" />

          {canvasReady && (
            <>
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CanvasVideoOverlay canvas={canvas} />
              {socket && <CollaborativeCursors socket={socket} />}
            </>
          )}
          <div className="flex-1 relative bg-gray-100">

            <canvas
              ref={canvasRef}
              width={1600}
              height={900}
              className="border shadow"
            />

          </div>
        </div>

        <div className="sidebar right">

          <div className="sidebar-tabs">
            <button
              className={rightTab === "properties" ? "active" : ""}
              onClick={() => setRightTab("properties")}
            >Properties</button>

            <button
              className={rightTab === "zoom" ? "active" : ""}
              onClick={() => setRightTab("zoom")}
            >Zoom</button>

            <button
              className={rightTab === "minimap" ? "active" : ""}
              onClick={() => setRightTab("minimap")}
            >Minimap</button>
          </div>

          <div className="sidebar-content">
            {rightTab === "properties" && <NodePropertiesPanel canvas={canvas} />}
            {rightTab === "zoom" && <ZoomControls />}
            {rightTab === "minimap" && <MiniMap />}
          </div>
        </div>

      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.object && (
            <>
              <div onClick={() => contextMenu.object.bringToFront()}>Bring Front</div>
              <div onClick={() => contextMenu.object.sendToBack()}>Send Back</div>
              <div onClick={() => {
                canvas.remove(contextMenu.object);
                setContextMenu(null);
              }}>Delete</div>
            </>
          )}
        </div>
      )}

      <FilePreviewModal
        file={previewFile}
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        canvas={canvas}
        addTextNode={addTextNode}
      />
    </div>
  );
}
*/







/*
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { fabric } from "fabric";

import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";

import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import MiniMapLive from "./MiniMapLive";
import MiniMapTimeline from "./MiniMapTimeline";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "./FloatingLayer";
import CanvasToolbar from "./CanvasToolbar";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";

import {
  createTextNode,
  createImageNode,
  createTaskCardNode,
} from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";

import "./canvas-layout.css";
import "./canvas-page.css";

const TOOLS = [
  "select","rect","circle","diamond","line","arrow",
  "pen","connector","text","file","url","task",
];

export default function MyCanvasPageEx({ channelId: channelIdProp }) {

  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;
  const roomId = channelId || "demo-room";

  const { canvas, nodes } = useContext(CanvasContext);
  const  socket  = useSocket();
  const { user } = useAuth();

  useCanvasEngine(roomId);

  
  const [canvasReady, setCanvasReady] = useState(false);
  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");

  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("properties");

  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

 
  useEffect(() => {
    if (canvas) setCanvasReady(true);
  }, [canvas]);


  const addToCanvas = useCallback((obj) => {
    if (!canvas) return;
    obj.id = obj.id || Date.now().toString();
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }, [canvas]);


  const addTextNode = () => {
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    addToCanvas(node);
  };

  const addParagraphNode = () => {
    const node = createTextNode(
      "This is a paragraph.\nYou can edit it."
    );
    node.set({ left: 300, top: 100, width: 200 });
    addToCanvas(node);
  };

  const addChecklistNode = () => {
    const node = createTextNode("- [ ] Item 1\n- [ ] Item 2");
    node.set({ left: 100, top: 250 });
    addToCanvas(node);
  };

  const addImageNode = async (url) => {
    const img = await createImageNode(url);
    img.set({ left: 200, top: 150 });
    addToCanvas(img);
  };

  const addTaskCardNode = () => {
    const node = createTaskCardNode("Task Card");
    node.set({ left: 200, top: 400 });
    addToCanvas(node);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText);
    note.set({ left: 150, top: 500 });
    addToCanvas(note);
    setNoteText("");
  };

  const addConnector = () => {
    if (nodes?.length >= 2) {
      connectNodes(canvas, nodes[nodes.length-2], nodes[nodes.length-1]);
    }
  };


  useEffect(() => {
    if (!canvas) return;

    const handler = (opt) => {
      if (opt.e.button === 2) {
        opt.e.preventDefault();
        setContextMenu({
          x: opt.e.clientX,
          y: opt.e.clientY,
          object: opt.target,
        });
      }
    };

    canvas.on("mouse:down", handler);
    return () => canvas.off("mouse:down", handler);
  }, [canvas]);


  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);


  return (
    <div className="canvas-layout">

    
      <div className="canvas-header">
        <div>Room: {roomId}</div>
        <div>
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
        </div>
      </div>

   
      <div className="canvas-body">

      
        <div className="sidebar left">

          <div className="sidebar-tabs">
            <button
              className={leftTab === "tools" ? "active" : ""}
              onClick={() => setLeftTab("tools")}
            >Tools</button>

            <button
              className={leftTab === "nodes" ? "active" : ""}
              onClick={() => setLeftTab("nodes")}
            >Nodes</button>

            <button
              className={leftTab === "layers" ? "active" : ""}
              onClick={() => setLeftTab("layers")}
            >Layers</button>
          </div>

          <div className="sidebar-content">
            {leftTab === "tools" && <CanvasToolbar />}
            {leftTab === "nodes" && <FloatingLayer />}
            {leftTab === "layers" && <LayerPanel />}
          </div>
        </div>


        <div
          className="canvas-wrapper"
          onDragOver={(e) => e.preventDefault()}
        >
          <canvas id="canvas" />

          {canvasReady && (
            <>
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CanvasVideoOverlay canvas={canvas} />
              {socket && <CollaborativeCursors socket={socket} />}
            </>
          )}
        </div>

        <div className="sidebar right">

          <div className="sidebar-tabs">
            <button
              className={rightTab === "properties" ? "active" : ""}
              onClick={() => setRightTab("properties")}
            >Properties</button>

            <button
              className={rightTab === "zoom" ? "active" : ""}
              onClick={() => setRightTab("zoom")}
            >Zoom</button>

            <button
              className={rightTab === "minimap" ? "active" : ""}
              onClick={() => setRightTab("minimap")}
            >Minimap</button>
          </div>

          <div className="sidebar-content">
            {rightTab === "properties" && <NodePropertiesPanel canvas={canvas} />}
            {rightTab === "zoom" && <ZoomControls />}
            {rightTab === "minimap" && <MiniMap />}
          </div>
        </div>

      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.object && (
            <>
              <div onClick={() => contextMenu.object.bringToFront()}>Bring Front</div>
              <div onClick={() => contextMenu.object.sendToBack()}>Send Back</div>
              <div onClick={() => {
                canvas.remove(contextMenu.object);
                setContextMenu(null);
              }}>Delete</div>
            </>
          )}
        </div>
      )}

      <FilePreviewModal
        file={previewFile}
        open={!!previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        canvas={canvas}
        addTextNode={addTextNode}
      />
    </div>
  );
}
*/
