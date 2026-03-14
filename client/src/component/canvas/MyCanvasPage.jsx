// frontend/src/component/canvas/MyCanvasPage.jsx
// frontend/src/component/canvas/MyCanvasPage.jsx
// frontend/src/component/canvas/MyCanvasPage.jsx
// frontend/src/component/canvas/MyCanvasPage.jsx
// frontend/src/component/canvas/MyCanvasPage.jsx
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanels from "./LayerPanels";
import MiniMap from "./MiniMap";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "./FloatingLayer";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";
import BoardCreationModal from "./BoardCreationModal"; // New board modal
import TimelinePlayer from "./TimelinePlayer"; // Timeline playback
import { request } from "../../api/client";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./my-canvas-page.css";

const TOOLS = [
  "select","rect","circle","diamond","line","arrow","pen",
  "connector","text","file","url","task"
];

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes, setNodes } = useContext(CanvasContext);
  const socket = useSocket();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [tool, setTool] = useState("select");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");
  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const defaultLayout = { leftWidth: 280, rightWidth: 300 };
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  // YJS Collaboration
  const [yDoc, setYDoc] = useState(null);
  const [yProvider, setYProvider] = useState(null);
  const roomId = channelId || "demo-room";

  // -------------------- Canvas Ready --------------------
  useEffect(() => { if (canvas) setCanvasReady(true); }, [canvas]);

  // -------------------- Init Room, Boards & YJS --------------------
  useEffect(() => {
    if (!channelId) return;
    const initRoom = async () => {
      try {
        const roomData = await request(`/mycanvas/room/${channelId}`);
        setRoom(roomData);

        const boardsData = await request(`/mycanvas/boards/${roomData._id}`);
        setBoards(boardsData);
        setTabs(boardsData.map(b => ({ id: b._id, name: b.name })));
        if (boardsData.length > 0) setActiveBoard(boardsData[0]);

        const activityData = await request(`/mycanvas/activity/${roomData._id}`);
        setActivityLogs(activityData);

        // YJS setup
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider("wss://your-yjs-server.com", roomData._id, ydoc);
        setYDoc(ydoc);
        setYProvider(provider);

      } catch (err) { console.error("Canvas init failed:", err); }
    };
    initRoom();
  }, [channelId]);

  useCanvasEngine(roomId);

  // -------------------- Load Canvas --------------------
  useEffect(() => {
    if (!canvas || !activeBoard?.fabricJson) return;
    canvas.loadFromJSON(activeBoard.fabricJson, () => canvas.renderAll());
  }, [canvas, activeBoard]);

  // -------------------- Auto Save --------------------
  useEffect(() => {
    if (!canvas || !activeBoard || !room) return;
    const interval = setInterval(async () => {
      try {
        const json = canvas.toJSON();
        await request(`/mycanvas/board/${activeBoard._id}`, { method:"PUT", body: JSON.stringify({ fabricJson: json }) });
        await request(`/mycanvas/activity`, { method:"POST", body: JSON.stringify({ roomId: room._id, boardId: activeBoard._id, action:"autosave", metadata:{objects:canvas.getObjects().length} }) });
      } catch(e){ console.error(e); }
    }, 10000);
    return () => clearInterval(interval);
  }, [canvas, activeBoard, room]);

  // -------------------- Load Snapshots --------------------
  useEffect(() => {
    if (!activeBoard) return;
    const loadSnapshots = async () => {
      const data = await request(`/mycanvas/snapshots/${activeBoard._id}`);
      setSnapshots(data);
    };
    loadSnapshots();
  }, [activeBoard]);

  // -------------------- YJS Live Collaboration --------------------
  useEffect(() => {
    if (!canvas || !yDoc) return;
    const yMap = yDoc.getMap("canvasObjects");

    // Remote updates
    yMap.observe(event => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === "add" || change.action === "update") {
          const objJson = yMap.get(key);
          if (!canvas.getObjects().find(o => o.id === key)) {
            canvas.loadFromJSON(objJson, () => canvas.renderAll());
          }
        }
      });
    });

    // Local updates
    const syncToYjs = () => {
      canvas.getObjects().forEach(obj => yMap.set(obj.id, obj.toJSON()));
    };
    canvas.on("object:added", syncToYjs);
    canvas.on("object:modified", syncToYjs);
    canvas.on("object:removed", syncToYjs);

    return () => {
      canvas.off("object:added", syncToYjs);
      canvas.off("object:modified", syncToYjs);
      canvas.off("object:removed", syncToYjs);
    };
  }, [canvas, yDoc]);

  // -------------------- Manual Save --------------------
  const handleManualSave = async () => {
    if (!canvas || !activeBoard) return;
    try {
      const json = canvas.toJSON();
      await request(`/mycanvas/board/${activeBoard._id}`, { method:"PUT", body: JSON.stringify({ fabricJson: json }) });
      logActivity("Manual Save");
    } catch(e){ console.error(e); }
  };

  // -------------------- Snapshot Restore --------------------
  const restoreSnapshot = (snapshot) => {
    if (!canvas) return;
    canvas.loadFromJSON(snapshot.fabricJson, () => {
      canvas.renderAll();
      logActivity("Snapshot Restored");
    });
  };

  // -------------------- Drag & Drop --------------------
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;
    const pointer = canvas.getPointer(e);
    for (let file of e.dataTransfer.files) {
      const url = URL.createObjectURL(file);
      let obj;
      if (file.type.startsWith("image/")) obj = await createImageNode(url);
      else obj = new fabric.Rect({ width:300,height:200,fill:"#000",left:pointer.x,top:pointer.y, id:Date.now().toString() });
      obj.set({ left:pointer.x, top:pointer.y });
      canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll();
    }
  };

  // -------------------- Node Factories --------------------
  const addToCanvas = useCallback(obj => { if(!canvas) return; obj.id=obj.id||Date.now().toString(); canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll(); }, [canvas]);
  const addTextNode = useCallback(()=>addToCanvas(createTextNode("Hello World").set({left:100,top:100})), [addToCanvas]);
  const addParagraphNode = useCallback(()=>addToCanvas(createTextNode("Paragraph\nEditable").set({left:300,top:100,width:200,fontSize:14})), [addToCanvas]);
  const addChecklistNode = useCallback(()=>addToCanvas(createTextNode("- [ ] Item 1\n- [ ] Item 2").set({left:100,top:250,width:180,fontSize:14,fill:"#333"})), [addToCanvas]);
  const addTaskCardNode = useCallback(()=>addToCanvas(createTaskCardNode("Task Card").set({left:200,top:400})), [addToCanvas]);
  const addImageNode = useCallback(async url=>addToCanvas(await createImageNode(url).set({left:250,top:200})), [addToCanvas]);

  // -------------------- Object Selection --------------------
  useEffect(() => {
    if (!canvas) return;
    const selectHandler = e=>{ const obj=e.target; if(!obj) return; setSelectedObject(obj); setLayerModalOpen(true); };
    canvas.on("object:selected", selectHandler);
    canvas.on("mouse:dblclick", selectHandler);
    return () => { canvas.off("object:selected", selectHandler); canvas.off("mouse:dblclick", selectHandler); };
  }, [canvas]);

  // -------------------- Layer Modal & Activity Logger --------------------
  const openLayerModal = obj => { setSelectedObject(obj); setLayerModalOpen(true); };
  const logActivity = text => setActivityLogs(prev=>[...prev,{text,time:Date.now()}]);

  // -------------------- Layout Persistence --------------------
  useEffect(()=>{ localStorage.setItem("canvas-layout",JSON.stringify(layout)); }, [layout]);

  return (
    <div className="canvas-page" style={{display:"flex",flexDirection:"column",height:"100vh"}}>
      {/* Topbar */}
      <div className="canvas-topbar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 10px",height:50,borderBottom:"1px solid #ccc"}}>
        <div className="topbar-left">
          <button onClick={()=>setLeftOpen(v=>!v)}>☰</button>
          <button onClick={()=>setRightOpen(v=>!v)}>⚙</button>
        </div>
        <div className="topbar-center">
          {tabs.map(tab=><div key={tab.id} className={`tab ${activeTab===tab.id?"active":""}`} onClick={()=>setActiveTab(tab.id)}>{tab.name}</div>)}
        </div>
        <div className="topbar-right" style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>canvas?.undo?.()}>Undo</button>
          <button onClick={()=>canvas?.redo?.()}>Redo</button>
          <button onClick={handleManualSave}>Save</button>
          <ZoomControls />
        </div>
      </div>

      {/* Workspace */}
      <div className="canvas-workspace" style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Left Sidebar */}
        {leftOpen && (
          <div className="sidebar left" style={{width:layout.leftWidth,borderRight:"1px solid #ddd",overflowY:"auto"}}>
            <div className="sidebar-tabs">
              <button className={leftTab==="tools"?"active":""} onClick={()=>setLeftTab("tools")}>Tools</button>
              <button className={leftTab==="layers"?"active":""} onClick={()=>setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content" style={{padding:8}}>
              {leftTab==="tools" && <>
                <div className="tool-grid" style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {TOOLS.map(t=><button key={t} className={tool===t?"active":""} onClick={()=>{setTool(t); canvas?.setActiveTool?.(t)}}>{t}</button>)}
                </div>
                <hr />
                <button onClick={addTextNode}>Add Text</button>
                <button onClick={addParagraphNode}>Add Paragraph</button>
                <button onClick={addChecklistNode}>Add Checklist</button>
                <button onClick={()=>addImageNode("https://via.placeholder.com/150")}>Add Image</button>
                <button onClick={addTaskCardNode}>Add Task Card</button>
                <button onClick={()=>setBoardModalOpen(true)}>+ New Board</button>
              </>}
              {leftTab==="layers" &&
                <LayerPanels canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} snapshots={snapshots} restoreSnapshot={restoreSnapshot} />}
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="canvas-wrapper" style={{flex:1,position:"relative"}} onDragOver={e=>e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && <>
            {showFloatingLayers && <FloatingLayer />}
            <CanvasVideoOverlay canvas={canvas} />
            {socket && <CollaborativeCursors socket={socket} />}
          </>}
        </div>

        {/* Right Sidebar */}
        {rightOpen && (
          <div className="sidebar right" style={{width:layout.rightWidth,borderLeft:"1px solid #ddd",overflowY:"auto"}}>
            <div className="sidebar-tabs">
              <button className={rightTab==="properties"?"active":""} onClick={()=>setRightTab("properties")}>Properties</button>
              <button className={rightTab==="zoom"?"active":""} onClick={()=>setRightTab("zoom")}>Zoom</button>
              <button className={rightTab==="minimap"?"active":""} onClick={()=>setRightTab("minimap")}>Minimap</button>
              <button className={rightTab==="timeline"?"active":""} onClick={()=>setRightTab("timeline")}>Timeline</button>
            </div>
            <div className="sidebar-content" style={{padding:8}}>
              {rightTab==="properties" && <NodePropertiesPanel canvas={canvas} />}
              {rightTab==="zoom" && <ZoomControls />}
              {rightTab==="minimap" && <MiniMap />}
              {rightTab==="timeline" && <TimelinePlayer canvas={canvas} activeBoard={activeBoard} />}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={()=>setLayerModalOpen(false)} onDelete={obj=>canvas.remove(obj)} />
      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={()=>setPreviewFile(null)} />
      <CommandPalette open={commandOpen} onClose={()=>setCommandOpen(false)} canvas={canvas} addTextNode={addTextNode} />
      <BoardCreationModal open={boardModalOpen} onClose={()=>setBoardModalOpen(false)} roomId={room?._id} onBoardCreated={newBoard=>{
        setBoards(prev=>[...prev,newBoard]);
        setTabs(prev=>[...prev,{id:newBoard._id,name:newBoard.name}]);
        setActiveBoard(newBoard);
      }} />
    </div>
  );
}




/*
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanels from "./LayerPanels";
import MiniMap from "./MiniMap";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "./FloatingLayer";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";
import BoardCreationModal from "./BoardCreationModal"; // New board modal
import TimelinePlayer from "./TimelinePlayer"; // Timeline playback
import { request } from "../../api/client";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./my-canvas-page.css";

const TOOLS = [
  "select","rect","circle","diamond","line","arrow","pen",
  "connector","text","file","url","task"
];

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes, setNodes } = useContext(CanvasContext);
  const socket = useSocket();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [tool, setTool] = useState("select");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");
  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const defaultLayout = { leftWidth: 280, rightWidth: 300 };
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  // YJS Collaboration
  const [yDoc, setYDoc] = useState(null);
  const [yProvider, setYProvider] = useState(null);
  const roomId = channelId || "demo-room";

  // -------------------- Canvas Ready --------------------
  useEffect(() => { if (canvas) setCanvasReady(true); }, [canvas]);

  // -------------------- Init Room, Boards & YJS --------------------
  useEffect(() => {
    if (!channelId) return;
    const initRoom = async () => {
      try {
        const roomData = await request(`/mycanvas/room/${channelId}`);
        setRoom(roomData);

        const boardsData = await request(`/mycanvas/boards/${roomData._id}`);
        setBoards(boardsData);
        setTabs(boardsData.map(b => ({ id: b._id, name: b.name })));
        if (boardsData.length > 0) setActiveBoard(boardsData[0]);

        const activityData = await request(`/mycanvas/activity/${roomData._id}`);
        setActivityLogs(activityData);

        // YJS setup
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider("wss://your-yjs-server.com", roomData._id, ydoc);
        setYDoc(ydoc);
        setYProvider(provider);

      } catch (err) { console.error("Canvas init failed:", err); }
    };
    initRoom();
  }, [channelId]);

  useCanvasEngine(roomId);

  // -------------------- Load Canvas --------------------
  useEffect(() => {
    if (!canvas || !activeBoard?.fabricJson) return;
    canvas.loadFromJSON(activeBoard.fabricJson, () => canvas.renderAll());
  }, [canvas, activeBoard]);

  // -------------------- Auto Save --------------------
  useEffect(() => {
    if (!canvas || !activeBoard || !room) return;
    const interval = setInterval(async () => {
      try {
        const json = canvas.toJSON();
        await request(`/mycanvas/board/${activeBoard._id}`, { method:"PUT", body: JSON.stringify({ fabricJson: json }) });
        await request(`/mycanvas/activity`, { method:"POST", body: JSON.stringify({ roomId: room._id, boardId: activeBoard._id, action:"autosave", metadata:{objects:canvas.getObjects().length} }) });
      } catch(e){ console.error(e); }
    }, 10000);
    return () => clearInterval(interval);
  }, [canvas, activeBoard, room]);

  // -------------------- Load Snapshots --------------------
  useEffect(() => {
    if (!activeBoard) return;
    const loadSnapshots = async () => {
      const data = await request(`/mycanvas/snapshots/${activeBoard._id}`);
      setSnapshots(data);
    };
    loadSnapshots();
  }, [activeBoard]);

  // -------------------- YJS Live Collaboration --------------------
  useEffect(() => {
    if (!canvas || !yDoc) return;
    const yMap = yDoc.getMap("canvasObjects");

    // Remote updates
    yMap.observe(event => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === "add" || change.action === "update") {
          const objJson = yMap.get(key);
          if (!canvas.getObjects().find(o => o.id === key)) {
            canvas.loadFromJSON(objJson, () => canvas.renderAll());
          }
        }
      });
    });

    // Local updates
    const syncToYjs = () => {
      canvas.getObjects().forEach(obj => yMap.set(obj.id, obj.toJSON()));
    };
    canvas.on("object:added", syncToYjs);
    canvas.on("object:modified", syncToYjs);
    canvas.on("object:removed", syncToYjs);

    return () => {
      canvas.off("object:added", syncToYjs);
      canvas.off("object:modified", syncToYjs);
      canvas.off("object:removed", syncToYjs);
    };
  }, [canvas, yDoc]);

  // -------------------- Manual Save --------------------
  const handleManualSave = async () => {
    if (!canvas || !activeBoard) return;
    try {
      const json = canvas.toJSON();
      await request(`/mycanvas/board/${activeBoard._id}`, { method:"PUT", body: JSON.stringify({ fabricJson: json }) });
      logActivity("Manual Save");
    } catch(e){ console.error(e); }
  };

  // -------------------- Snapshot Restore --------------------
  const restoreSnapshot = (snapshot) => {
    if (!canvas) return;
    canvas.loadFromJSON(snapshot.fabricJson, () => {
      canvas.renderAll();
      logActivity("Snapshot Restored");
    });
  };

  // -------------------- Drag & Drop --------------------
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;
    const pointer = canvas.getPointer(e);
    for (let file of e.dataTransfer.files) {
      const url = URL.createObjectURL(file);
      let obj;
      if (file.type.startsWith("image/")) obj = await createImageNode(url);
      else obj = new fabric.Rect({ width:300,height:200,fill:"#000",left:pointer.x,top:pointer.y, id:Date.now().toString() });
      obj.set({ left:pointer.x, top:pointer.y });
      canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll();
    }
  };

  // -------------------- Node Factories --------------------
  const addToCanvas = useCallback(obj => { if(!canvas) return; obj.id=obj.id||Date.now().toString(); canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll(); }, [canvas]);
  const addTextNode = useCallback(()=>addToCanvas(createTextNode("Hello World").set({left:100,top:100})), [addToCanvas]);
  const addParagraphNode = useCallback(()=>addToCanvas(createTextNode("Paragraph\nEditable").set({left:300,top:100,width:200,fontSize:14})), [addToCanvas]);
  const addChecklistNode = useCallback(()=>addToCanvas(createTextNode("- [ ] Item 1\n- [ ] Item 2").set({left:100,top:250,width:180,fontSize:14,fill:"#333"})), [addToCanvas]);
  const addTaskCardNode = useCallback(()=>addToCanvas(createTaskCardNode("Task Card").set({left:200,top:400})), [addToCanvas]);
  const addImageNode = useCallback(async url=>addToCanvas(await createImageNode(url).set({left:250,top:200})), [addToCanvas]);

  // -------------------- Object Selection --------------------
  useEffect(() => {
    if (!canvas) return;
    const selectHandler = e=>{ const obj=e.target; if(!obj) return; setSelectedObject(obj); setLayerModalOpen(true); };
    canvas.on("object:selected", selectHandler);
    canvas.on("mouse:dblclick", selectHandler);
    return () => { canvas.off("object:selected", selectHandler); canvas.off("mouse:dblclick", selectHandler); };
  }, [canvas]);

  // -------------------- Layer Modal & Activity Logger --------------------
  const openLayerModal = obj => { setSelectedObject(obj); setLayerModalOpen(true); };
  const logActivity = text => setActivityLogs(prev=>[...prev,{text,time:Date.now()}]);

  // -------------------- Layout Persistence --------------------
  useEffect(()=>{ localStorage.setItem("canvas-layout",JSON.stringify(layout)); }, [layout]);

  return (
    <div className="canvas-page" style={{display:"flex",flexDirection:"column",height:"100vh"}}>

      <div className="canvas-topbar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 10px",height:50,borderBottom:"1px solid #ccc"}}>
        <div className="topbar-left">
          <button onClick={()=>setLeftOpen(v=>!v)}>☰</button>
          <button onClick={()=>setRightOpen(v=>!v)}>⚙</button>
        </div>
        <div className="topbar-center">
          {tabs.map(tab=><div key={tab.id} className={`tab ${activeTab===tab.id?"active":""}`} onClick={()=>setActiveTab(tab.id)}>{tab.name}</div>)}
        </div>
        <div className="topbar-right" style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>canvas?.undo?.()}>Undo</button>
          <button onClick={()=>canvas?.redo?.()}>Redo</button>
          <button onClick={handleManualSave}>Save</button>
          <ZoomControls />
        </div>
      </div>

 
      <div className="canvas-workspace" style={{display:"flex",flex:1,overflow:"hidden"}}>
    
        {leftOpen && (
          <div className="sidebar left" style={{width:layout.leftWidth,borderRight:"1px solid #ddd",overflowY:"auto"}}>
            <div className="sidebar-tabs">
              <button className={leftTab==="tools"?"active":""} onClick={()=>setLeftTab("tools")}>Tools</button>
              <button className={leftTab==="layers"?"active":""} onClick={()=>setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content" style={{padding:8}}>
              {leftTab==="tools" && <>
                <div className="tool-grid" style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {TOOLS.map(t=><button key={t} className={tool===t?"active":""} onClick={()=>{setTool(t); canvas?.setActiveTool?.(t)}}>{t}</button>)}
                </div>
                <hr />
                <button onClick={addTextNode}>Add Text</button>
                <button onClick={addParagraphNode}>Add Paragraph</button>
                <button onClick={addChecklistNode}>Add Checklist</button>
                <button onClick={()=>addImageNode("https://via.placeholder.com/150")}>Add Image</button>
                <button onClick={addTaskCardNode}>Add Task Card</button>
                <button onClick={()=>setBoardModalOpen(true)}>+ New Board</button>
              </>}
              {leftTab==="layers" &&
                <LayerPanels canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} snapshots={snapshots} restoreSnapshot={restoreSnapshot} />}
            </div>
          </div>
        )}


        <div className="canvas-wrapper" style={{flex:1,position:"relative"}} onDragOver={e=>e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && <>
            {showFloatingLayers && <FloatingLayer />}
            <CanvasVideoOverlay canvas={canvas} />
            {socket && <CollaborativeCursors socket={socket} />}
          </>}
        </div>


        {rightOpen && (
          <div className="sidebar right" style={{width:layout.rightWidth,borderLeft:"1px solid #ddd",overflowY:"auto"}}>
            <div className="sidebar-tabs">
              <button className={rightTab==="properties"?"active":""} onClick={()=>setRightTab("properties")}>Properties</button>
              <button className={rightTab==="zoom"?"active":""} onClick={()=>setRightTab("zoom")}>Zoom</button>
              <button className={rightTab==="minimap"?"active":""} onClick={()=>setRightTab("minimap")}>Minimap</button>
              <button className={rightTab==="timeline"?"active":""} onClick={()=>setRightTab("timeline")}>Timeline</button>
            </div>
            <div className="sidebar-content" style={{padding:8}}>
              {rightTab==="properties" && <NodePropertiesPanel canvas={canvas} />}
              {rightTab==="zoom" && <ZoomControls />}
              {rightTab==="minimap" && <MiniMap />}
              {rightTab==="timeline" && <TimelinePlayer canvas={canvas} activeBoard={activeBoard} />}
            </div>
          </div>
        )}
      </div>


      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={()=>setLayerModalOpen(false)} onDelete={obj=>canvas.remove(obj)} />
      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={()=>setPreviewFile(null)} />
      <CommandPalette open={commandOpen} onClose={()=>setCommandOpen(false)} canvas={canvas} addTextNode={addTextNode} />
      <BoardCreationModal open={boardModalOpen} onClose={()=>setBoardModalOpen(false)} roomId={room?._id} onBoardCreated={newBoard=>{
        setBoards(prev=>[...prev,newBoard]);
        setTabs(prev=>[...prev,{id:newBoard._id,name:newBoard.name}]);
        setActiveBoard(newBoard);
      }} />
    </div>
  );
}
*/


/*
// frontend/src/component/canvas/MyCanvasPage.jsx
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "./FloatingLayer";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";
import BoardCreationModal from "./BoardCreationModal"; // New board modal
import TimelinePlayer from "./TimelinePlayer"; // Timeline playback
import { request } from "../../api/client";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./my-canvas-page.css";
import LayerPanels from "./LayerPanels";

const TOOLS = [
  "select","rect","circle","diamond","line","arrow","pen",
  "connector","text","file","url","task"
];

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes, setNodes } = useContext(CanvasContext);
  const socket = useSocket();
  const { user } = useAuth();

  // Backend states
  const [room, setRoom] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // UI states
  const [tool, setTool] = useState("select");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");
  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);
  const [boardModalOpen, setBoardModalOpen] = useState(false);
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const defaultLayout = { leftWidth: 280, rightWidth: 300 };
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  // YJS Collaboration
  const [yDoc, setYDoc] = useState(null);
  const [yProvider, setYProvider] = useState(null);

  const roomId = channelId || "demo-room";

  // -------------------- Canvas Setup --------------------
  useEffect(() => { if (canvas) setCanvasReady(true); }, [canvas]);

  // -------------------- Init Room & Boards --------------------
  useEffect(() => {
    if (!channelId) return;
    const initRoom = async () => {
      try {
        const roomData = await request(`/mycanvas/room/${channelId}`);
        setRoom(roomData);

        const boardsData = await request(`/mycanvas/boards/${roomData._id}`);
        setBoards(boardsData);
        setTabs(boardsData.map(b => ({ id: b._id, name: b.name })));
        if (boardsData.length > 0) setActiveBoard(boardsData[0]);

        const activityData = await request(`/mycanvas/activity/${roomData._id}`);
        setActivityLogs(activityData);

        // Setup YJS
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider("wss://your-yjs-server.com", roomData._id, ydoc);
        setYDoc(ydoc);
        setYProvider(provider);

      } catch (err) {
        console.error("Canvas init failed:", err);
      }
    };
    initRoom();
  }, [channelId]);

  useCanvasEngine(roomId);

  // -------------------- Load Saved Canvas --------------------
  useEffect(() => {
    if (!canvas || !activeBoard?.fabricJson) return;
    canvas.loadFromJSON(activeBoard.fabricJson, () => canvas.renderAll());
  }, [canvas, activeBoard]);

  // -------------------- Auto Save Board --------------------
  useEffect(() => {
    if (!canvas || !activeBoard || !room) return;
    const autoSave = async () => {
      try {
        const json = canvas.toJSON();
        await request(`/mycanvas/board/${activeBoard._id}`, { method: "PUT", body: JSON.stringify({ fabricJson: json }) });
        await request(`/mycanvas/activity`, { method: "POST", body: JSON.stringify({ roomId: room._id, boardId: activeBoard._id, action: "autosave", metadata: { objects: canvas.getObjects().length } }) });
      } catch (err) { console.error("Auto save failed:", err); }
    };
    const interval = setInterval(autoSave, 10000);
    return () => clearInterval(interval);
  }, [canvas, activeBoard, room]);

  // -------------------- Load Snapshots --------------------
  useEffect(() => {
    if (!activeBoard) return;
    const loadSnapshots = async () => {
      const data = await request(`/mycanvas/snapshots/${activeBoard._id}`);
      setSnapshots(data);
    };
    loadSnapshots();
  }, [activeBoard]);

  // Inside useEffect after canvas is ready
  useEffect(() => {
    if (!canvas || !yDoc) return;

    // Bind canvas objects to YJS shared type
    const yMap = yDoc.getMap("canvasObjects");

    // Observe changes from other clients
    yMap.observe(event => {
      event.changes.keys.forEach((change, key) => {
        if (change.action === "add" || change.action === "update") {
          const objJson = yMap.get(key);
          if (canvas.getObjects().find(o => o.id === key)) return;
          canvas.loadFromJSON(objJson, () => canvas.renderAll());
        }
      });
    });

    // Local changes => update YJS
    const onObjectModified = () => {
      canvas.getObjects().forEach(obj => {
        yMap.set(obj.id, obj.toJSON());
      });
    };

    canvas.on("object:modified", onObjectModified);
    canvas.on("object:added", onObjectModified);
    canvas.on("object:removed", onObjectModified);

    return () => {
      canvas.off("object:modified", onObjectModified);
      canvas.off("object:added", onObjectModified);
      canvas.off("object:removed", onObjectModified);
    };
  }, [canvas, yDoc]);

  // -------------------- Manual Save --------------------
  const handleManualSave = async () => {
    if (!canvas || !activeBoard) return;
    try {
      const json = canvas.toJSON();
      await request(`/mycanvas/board/${activeBoard._id}`, { method: "PUT", body: JSON.stringify({ fabricJson: json }) });
      logActivity("Manual Save");
    } catch (err) { console.error(err); }
  };

  // -------------------- Snapshot Restore --------------------
  const restoreSnapshot = async (snapshot) => {
    if (!canvas) return;
    canvas.loadFromJSON(snapshot.fabricJson, () => {
      canvas.renderAll();
      logActivity("Snapshot Restored");
    });
  };

  // -------------------- Drag & Drop --------------------
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;
    const pointer = canvas.getPointer(e);
    for (let file of e.dataTransfer.files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);
      let obj;
      if (file.type.startsWith("image/")) {
        obj = await createImageNode(url);
      } else {
        obj = new fabric.Rect({ width: 300, height: 200, fill: "#000", left: pointer.x, top: pointer.y });
        obj.customType = "video"; obj.videoUrl = url; obj.id = Date.now().toString();
      }
      obj.set({ left: pointer.x, top: pointer.y });
      canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll();

      if (room && activeBoard) {
        await request(`/mycanvas/file`, { method: "POST", body: JSON.stringify({ room: room._id, board: activeBoard._id, filename: file.name, size: file.size, type: file.type }) });
      }
    }
  };

  // -------------------- Node Factories --------------------
  const addToCanvas = useCallback((obj) => {
    if (!canvas) return;
    obj.id = obj.id || Date.now().toString();
    canvas.add(obj); canvas.setActiveObject(obj); canvas.requestRenderAll();
  }, [canvas]);

  const addTextNode = useCallback(() => { addToCanvas(createTextNode("Hello World").set({ left:100, top:100 })); }, [canvas, addToCanvas]);
  const addParagraphNode = useCallback(() => { addToCanvas(createTextNode("This is a paragraph.\nYou can edit it.").set({ left:300, top:100, width:200, fontSize:14 })); }, [canvas, addToCanvas]);
  const addChecklistNode = useCallback(() => { addToCanvas(createTextNode("- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3").set({ left:100, top:250, width:180, fontSize:14, fill:"#333" })); }, [canvas, addToCanvas]);
  const addTaskCardNode = useCallback(() => { addToCanvas(createTaskCardNode("Task Card Example").set({ left:200, top:400 })); }, [canvas, addToCanvas]);
  const addImageNode = useCallback(async (url) => { addToCanvas(await createImageNode(url).set({ left:250, top:200 })); }, [canvas, addToCanvas]);

  // -------------------- Object Selection --------------------
  useEffect(() => {
    if (!canvas) return;
    const onObjectSelected = (e) => { const obj = e.target; if (!obj) return; setSelectedObject(obj); setLayerModalOpen(true); };
    canvas.on("object:selected", onObjectSelected);
    canvas.on("mouse:dblclick", onObjectSelected);
    return () => { canvas.off("object:selected", onObjectSelected); canvas.off("mouse:dblclick", onObjectSelected); };
  }, [canvas]);

  // -------------------- Layer Modal & Activity Logger --------------------
  const openLayerModal = (obj) => { setSelectedObject(obj); setLayerModalOpen(true); };
  const logActivity = (text) => setActivityLogs(prev => [...prev, { text, time: Date.now() }]);

  // -------------------- Layout Persistence --------------------
  useEffect(() => { localStorage.setItem("canvas-layout", JSON.stringify(layout)); }, [layout]);
  const startResize = (e, side) => { const startX = e.clientX; const move = (eMove) => setLayout(prev => ({ ...prev, leftWidth: Math.max(200, prev.leftWidth + (side==="left"? eMove.clientX-startX : 0)) })); const stop = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", stop); }; window.addEventListener("mousemove", move); window.addEventListener("mouseup", stop); };

  // -------------------- Keyboard Shortcuts --------------------
  useEffect(() => { const handler = e => { if(e.ctrlKey && e.key==="k") { e.preventDefault(); setCommandOpen(true); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, []);

  return (
    <div className="canvas-page" style={{ display:"flex", flexDirection:"column", height:"100vh" }}>

      <div className="canvas-topbar" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 10px", height:50, borderBottom:"1px solid #ccc" }}>
        <div className="topbar-left">
          <button onClick={()=>setLeftOpen(v=>!v)}>☰</button>
          <button onClick={()=>setRightOpen(v=>!v)}>⚙</button>
        </div>
        <div className="topbar-center">
          {tabs.map(tab=>(
            <div key={tab.id} className={`tab ${activeTab===tab.id?"active":""}`} onClick={()=>setActiveTab(tab.id)}>{tab.name}</div>
          ))}
        </div>
        <div className="topbar-right" style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={()=>canvas?.undo?.()}>Undo</button>
          <button onClick={()=>canvas?.redo?.()}>Redo</button>
          <button onClick={handleManualSave}>Save</button>
          <ZoomControls />
        </div>
      </div>

     
      <div className="canvas-workspace" style={{ display:"flex", flex:1, overflow:"hidden" }}>
   
        {leftOpen && (
          <div className="sidebar left" style={{ width:layout.leftWidth, borderRight:"1px solid #ddd", overflowY:"auto" }}>
            <div className="sidebar-tabs">
              <button className={leftTab==="tools"?"active":""} onClick={()=>setLeftTab("tools")}>Tools</button>
              <button className={leftTab==="layers"?"active":""} onClick={()=>setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content" style={{ padding:8 }}>
              {leftTab==="tools" && <>
                <div className="tool-grid" style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                  {TOOLS.map(t=><button key={t} className={tool===t?"active":""} onClick={()=>{ setTool(t); canvas?.setActiveTool?.(t); }}>{t}</button>)}
                </div>
                <hr />
                <button onClick={addTextNode}>Add Text</button>
                <button onClick={addParagraphNode}>Add Paragraph</button>
                <button onClick={addChecklistNode}>Add Checklist</button>
                <button onClick={()=>addImageNode("https://via.placeholder.com/150")}>Add Image</button>
                <button onClick={addTaskCardNode}>Add Task Card</button>
                <button onClick={()=>setBoardModalOpen(true)}>+ New Board</button>
              </>}
              {leftTab==="layers" && 
                <LayerPanels canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} snapshots={snapshots} restoreSnapshot={restoreSnapshot} />}
            </div>
          </div>
        )}

     
        <div className="canvas-wrapper" style={{ flex:1, position:"relative" }} onDragOver={e=>e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && <>
            {showFloatingLayers && <FloatingLayer />}
            <CanvasVideoOverlay canvas={canvas} />
            {socket && <CollaborativeCursors socket={socket} />}
          </>}
        </div>

   
        {rightOpen && (
          <div className="sidebar right" style={{ width:layout.rightWidth, borderLeft:"1px solid #ddd", overflowY:"auto" }}>
            <div className="sidebar-tabs">
              <button className={rightTab==="properties"?"active":""} onClick={()=>setRightTab("properties")}>Properties</button>
              <button className={rightTab==="zoom"?"active":""} onClick={()=>setRightTab("zoom")}>Zoom</button>
              <button className={rightTab==="minimap"?"active":""} onClick={()=>setRightTab("minimap")}>Minimap</button>
              
              <button className={rightTab === "timeline" ? "active" : ""} onClick={() => setRightTab("timeline")}>
                Timeline
              </button>
            </div>
            <div className="sidebar-content" style={{ padding:8 }}>
              {rightTab==="properties" && <NodePropertiesPanel canvas={canvas} />}
              {rightTab==="zoom" && <ZoomControls />}
              {rightTab==="minimap" && <MiniMap />}
              {rightTab === "timeline" && <TimelinePlayer canvas={canvas} activeBoard={activeBoard} />}
            </div>
          </div>
        )}
      </div>

  
      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={()=>setLayerModalOpen(false)} onDelete={obj=>canvas.remove(obj)} />
      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={()=>setPreviewFile(null)} />
      <CommandPalette open={commandOpen} onClose={()=>setCommandOpen(false)} canvas={canvas} addTextNode={addTextNode} />
      <BoardCreationModal open={boardModalOpen} onClose={()=>setBoardModalOpen(false)} roomId={room?._id} onBoardCreated={newBoard => { setBoards(prev=>[...prev,newBoard]); setTabs(prev=>[...prev,{id:newBoard._id,name:newBoard.name}]); setActiveBoard(newBoard); }} />
    </div>
  );
}
*/




/*
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "./FloatingLayer";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";
import { request } from "../../api/client";
 import "./my-canvas-page.css";

import {
  createTextNode,
  createImageNode,
  createTaskCardNode,
} from "../../utils/nodeFactory";

const TOOLS = [
  "select", "rect", "circle", "diamond", "line", "arrow", "pen",
  "connector", "text", "file", "url", "task"
];

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes, setNodes } = useContext(CanvasContext);
  const socket = useSocket();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [boards, setBoards] = useState([]);
  const [activeBoard, setActiveBoard] = useState(null);
  const [snapshots, setSnapshots] = useState([]);

  // const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");

  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);

  const [tabs, setTabs] = useState([{ id: roomId, name: "Board 1" }]);
  const [activeTab, setActiveTab] = useState(roomId);
  const [activityLogs, setActivityLogs] = useState([]);

  const defaultLayout = { leftWidth: 280, rightWidth: 300 };
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });



  // -------------------- Canvas Setup --------------------
  useEffect(() => {
    if (canvas) setCanvasReady(true);
  }, [canvas]);

  useEffect(() => {
    if (!channelId) return;

    const initRoom = async () => {
      try {
        // ROOM
        const roomData = await request(`/mycanvas/room/${channelId}`);
        setRoom(roomData);

        // BOARDS
        const boardsData = await request(`/mycanvas/boards/${roomData._id}`);
        setBoards(boardsData);

        if (boardsData.length > 0) {
          setActiveBoard(boardsData[0]);
        }

        // ACTIVITY
        const activityData = await request(`/mycanvas/activity/${roomData._id}`);
        setActivityLogs(activityData);

      } catch (err) {
        console.error("Canvas init failed:", err);
      }
    };

    initRoom();
  }, [channelId]);

  const roomId = channelId || "demo-room";

  useCanvasEngine(roomId);

  useEffect(() => {
    if (!canvas || !activeBoard?.fabricJson) return;

    canvas.loadFromJSON(activeBoard.fabricJson, () => {
      canvas.renderAll();
    });

  }, [canvas, activeBoard]);

  useEffect(() => {
    if (!canvas || !activeBoard || !room) return;

    const autoSave = async () => {
      try {
        const json = canvas.toJSON();

        await request(`/mycanvas/board/${activeBoard._id}`, {
          method: "PUT",
          body: JSON.stringify({ fabricJson: json }),
        });

        await request(`/mycanvas/activity`, {
          method: "POST",
          body: JSON.stringify({
            roomId: room._id,
            boardId: activeBoard._id,
            action: "autosave",
            metadata: { objects: canvas.getObjects().length },
          }),
        });

      } catch (err) {
        console.error("Auto save failed:", err);
      }
    };

    const interval = setInterval(autoSave, 10000);
    return () => clearInterval(interval);

  }, [canvas, activeBoard, room]);

  useEffect(() => {
    if (!activeBoard) return;

    const loadSnapshots = async () => {
      const data = await request(`/mycanvas/snapshots/${activeBoard._id}`);
      setSnapshots(data);
    };

    loadSnapshots();
  }, [activeBoard]);

  if (room && activeBoard) {
    await request(`/mycanvas/file`, {
      method: "POST",
      body: JSON.stringify({
        room: room._id,
        board: activeBoard._id,
        filename: file.name,
        size: file.size,
        type: file.type,
      }),
    });
  }

  const logActivity = (text) =>
    setActivityLogs((prev) => [...prev, { text, time: Date.now() }]);

  // -------------------- Layer Modal --------------------
  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  // -------------------- Keyboard Shortcuts --------------------
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

  // -------------------- Add to Canvas --------------------
  const addToCanvas = useCallback(
    (obj) => {
      if (!canvas) return;
      obj.id = obj.id || Date.now().toString();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    },
    [canvas]
  );

  // -------------------- Node Factories --------------------
  const addTextNode = useCallback(() => {
    if (!canvas) return;
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addParagraphNode = useCallback(() => {
    if (!canvas) return;
    const node = createTextNode("This is a paragraph.\nYou can edit it.");
    node.set({ left: 300, top: 100, width: 200, fontSize: 14 });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addChecklistNode = useCallback(() => {
    if (!canvas) return;
    const node = createTextNode("- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3");
    node.set({ left: 100, top: 250, width: 180, fontSize: 14, fill: "#333" });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addTaskCardNode = useCallback(() => {
    if (!canvas) return;
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addImageNode = useCallback(async (url) => {
    if (!canvas) return;
    const img = await createImageNode(url);
    img.set({ left: 250, top: 200 });
    addToCanvas(img);
  }, [canvas, addToCanvas]);

  // -------------------- Object Selection --------------------
  useEffect(() => {
    if (!canvas) return;
    const onObjectSelected = (e) => {
      const obj = e.target;
      if (!obj) return;
      setSelectedObject(obj);
      setLayerModalOpen(true);
    };

    canvas.on("object:selected", onObjectSelected);
    canvas.on("mouse:dblclick", onObjectSelected);

    return () => {
      canvas.off("object:selected", onObjectSelected);
      canvas.off("mouse:dblclick", onObjectSelected);
    };
  }, [canvas]);

  // -------------------- Drag & Drop --------------------
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;
    const pointer = canvas.getPointer(e);
    for (let file of e.dataTransfer.files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);
      if (file.type.startsWith("image/")) {
        const img = await createImageNode(url);
        img.set({ left: pointer.x, top: pointer.y });
        addToCanvas(img);
      } else if (file.type.startsWith("video/")) {
        const rect = new fabric.Rect({
          width: 300,
          height: 200,
          fill: "#000",
          left: pointer.x,
          top: pointer.y,
        });
        rect.customType = "video";
        rect.videoUrl = url;
        rect.id = Date.now().toString();
        addToCanvas(rect);
      }
    }
  };

  // -------------------- Layout Persistence --------------------
  useEffect(() => {
    localStorage.setItem("canvas-layout", JSON.stringify(layout));
  }, [layout]);

  const startResize = (e, side) => {
    const startX = e.clientX;
    const move = (eMove) =>
      setLayout((prev) => ({
        ...prev,
        leftWidth: Math.max(
          200,
          prev.leftWidth + (side === "left" ? eMove.clientX - startX : 0)
        ),
      }));
    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  return (
    <div className="canvas-page" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
    
      <div className="canvas-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px", height: 50, borderBottom: "1px solid #ccc" }}>
        <div className="topbar-left">
          <button onClick={() => setLeftOpen((v) => !v)}>☰</button>
          <button onClick={() => setRightOpen((v) => !v)}>⚙</button>
        </div>
        <div className="topbar-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </div>
          ))}
        </div>
        <div className="topbar-right" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
          <ZoomControls />
        </div>
      </div>

     
      <div className="canvas-workspace" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
   
        {leftOpen && (
          <div className="sidebar left" style={{ width: layout.leftWidth, borderRight: "1px solid #ddd", overflowY: "auto" }}>
            <div className="sidebar-tabs">
              <button className={leftTab === "tools" ? "active" : ""} onClick={() => setLeftTab("tools")}>Tools</button>
              <button className={leftTab === "layers" ? "active" : ""} onClick={() => setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content" style={{ padding: 8 }}>
              {leftTab === "tools" && (
                <>
                  <div className="tool-grid" style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {TOOLS.map((t) => (
                      <button key={t} className={tool === t ? "active" : ""} onClick={() => { setTool(t); canvas?.setActiveTool?.(t); }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <hr />
                  <button onClick={addTextNode}>Add Text</button>
                  <button onClick={addParagraphNode}>Add Paragraph</button>
                  <button onClick={addChecklistNode}>Add Checklist</button>
                  <button onClick={() => addImageNode("https://via.placeholder.com/150")}>Add Image</button>
                  <button onClick={addTaskCardNode}>Add Task Card</button>
                </>
              )}
              {leftTab === "layers" && (
                <LayerPanel canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} />
              )}
            </div>
          </div>
        )}

   
        <div className="canvas-wrapper" style={{ flex: 1, position: "relative" }} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && <>
            {showFloatingLayers && <FloatingLayer />}
            <CanvasVideoOverlay canvas={canvas} />
            {socket && <CollaborativeCursors socket={socket} />}
          </>}
        </div>

 
        {rightOpen && (
          <div className="sidebar right" style={{ width: layout.rightWidth, borderLeft: "1px solid #ddd", overflowY: "auto" }}>
            <div className="sidebar-tabs">
              <button className={rightTab === "properties" ? "active" : ""} onClick={() => setRightTab("properties")}>Properties</button>
              <button className={rightTab === "zoom" ? "active" : ""} onClick={() => setRightTab("zoom")}>Zoom</button>
              <button className={rightTab === "minimap" ? "active" : ""} onClick={() => setRightTab("minimap")}>Minimap</button>
            </div>
            <div className="sidebar-content" style={{ padding: 8 }}>
              {rightTab === "properties" && <NodePropertiesPanel canvas={canvas} />}
              {rightTab === "zoom" && <ZoomControls />}
              {rightTab === "minimap" && <MiniMap />}
            </div>
          </div>
        )}
      </div>


      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={() => setLayerModalOpen(false)} onDelete={(obj) => canvas.remove(obj)} />
      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} canvas={canvas} addTextNode={addTextNode} />
    </div>
  );
}
*/







/*
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import {
  createTextNode,
  createImageNode,
  createTaskCardNode,
} from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
 import "./my-canvas-page.css";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";


const TOOLS = [
  "select", "rect", "circle", "diamond", "line", "arrow", "pen",
  "connector", "text", "file", "url", "task"
];

function ContextMenu({ data, onClose, canvas, logActivity }) {
  if (!data) return null;
  const { x, y, object } = data;

  const toggleVisibility = () => {
    object.visible = !object.visible;
    canvas.requestRenderAll();
    logActivity(`${object.type} visibility ${object.visible ? "shown" : "hidden"}`);
    onClose();
  };

  const toggleLock = () => {
    object.lockMovementX = !object.lockMovementX;
    object.lockMovementY = !object.lockMovementY;
    logActivity(`${object.type} ${object.lockMovementX ? "locked" : "unlocked"}`);
    onClose();
  };

  const bringFront = () => {
    object.bringToFront();
    canvas.requestRenderAll();
    logActivity(`${object.type} moved to front`);
    onClose();
  };

  const sendBack = () => {
    object.sendToBack();
    canvas.requestRenderAll();
    logActivity(`${object.type} moved to back`);
    onClose();
  };

  const deleteObject = () => {
    canvas.remove(object);
    canvas.requestRenderAll();
    logActivity(`Deleted ${object.type}`);
    onClose();
  };

  return (
    <div className="context-menu" style={{ top: y, left: x }} onMouseLeave={onClose}>
      <div onClick={bringFront}>Bring Front</div>
      <div onClick={sendBack}>Send Back</div>
      <div onClick={toggleVisibility}>Toggle Visibility</div>
      <div onClick={toggleLock}>Lock/Unlock</div>
      <div onClick={deleteObject}>Delete</div>
    </div>
  );
}

// Props come from MyCanvasPageRoute (via useParams there).
// useParams() here is a fallback in case the page is used standalone.
export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes } = useContext(CanvasContext);
  const socket  = useSocket();
  const { user } = useAuth();
  // Each channel gets its own collaborative room
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");
  const [canvasReady, setCanvasReady] = useState(false);

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");

  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [tabs, setTabs] = useState([{ id: roomId, name: "Board 1" }]);
  const [activeTab, setActiveTab] = useState(roomId);

  const [activityLogs, setActivityLogs] = useState([]);

  const [showFloatingLayers, setShowFloatingLayers] = useState(false);

  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);

  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  // Track when canvas is truly ready
  useEffect(() => {
    if (canvas) setCanvasReady(true);
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

  

  // Boot Fabric + Yjs CRDT + socket sync
  useCanvasEngine(roomId);
  // useCanvasEngine(activeTab);

  const logActivity = (text) => {
    setActivityLogs(prev => [...prev, { text, time: Date.now() }]);
  };

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = (e) => {
      if (!e.target) return;
      setSelectedObject(e.target);
      setLayerModalOpen(true);
    };

    canvas.on("mouse:dblclick", handleSelection); // double-click on object
    return () => canvas.off("mouse:dblclick", handleSelection);
  }, [canvas]);

  const handleDeleteObject = (obj) => {
    if (!canvas || !obj) return;
    canvas.remove(obj);
    canvas.requestRenderAll();
    logActivity(`Deleted ${obj.customType || obj.type}`);
  };

  // ── Guard: silently no-op if canvas not yet initialised ────────────────────
  const whenReady = (fn) =>
    (...args) => {
      if (!canvas) return;
      fn(...args);
    };

  
  // add to canvas

  const addToCanvas = useCallback(
    (obj) => {
      if (!canvas) return;
      obj.id = obj.id || Date.now().toString();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    },
    [canvas]
  );

  useEffect(() => {
  if (!canvas) return;

  canvas.on("mouse:down", function(opt) {
      if (opt.e.button === 2) {
        opt.e.preventDefault();

        const obj = opt.target;

        setContextMenu({
          x: opt.e.clientX,
          y: opt.e.clientY,
          object: obj
        });
      }
    });

  }, [canvas]);

  // ── Node factories ──────────────────────────────────────────────────────────

  const addTextNode = async () => {
    if (!canvas) return;
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    addToCanvas(node);
  };

  const addParagraphNode = whenReady(() => {
    const node = createTextNode(
      "This is a paragraph with multiple lines.\nYou can edit it."
    );
    node.set({ left: 300, top: 100, width: 200, fontSize: 14 });
    // canvas.add(node);
    addToCanvas(node);
  });

  const addChecklistNode = whenReady(() => {
    const node = createTextNode(
      "- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3"
    );
    node.set({ left: 100, top: 250, width: 180, fontSize: 14, fill: "#333" });
    // canvas.add(node);
    addToCanvas(node);
  });

  const addImageNode = async (url) => {
    if (!canvas) return;
    const img = await createImageNode(url);
    img.set({ left: 200, top: 150 });
    canvas.add(img);
    logActivity(`Added image (${img.id})`);
  };

  const addPhotoNode = whenReady(async (fileUrl) => {
    const img = await createImageNode(fileUrl);
    img.set({ left: 250, top: 200 });
    addToCanvas(img);
  });

  const addTaskCardNode = whenReady(() => {
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    // canvas.add(node);
    addToCanvas(node);
  });

  const addNote = whenReady(() => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, {
      fill: "#222",
      fontSize: 14,
      width: 200,
    });
    note.set({ left: 150, top: 550 });
    // canvas.add(note);
    addToCanvas(node);
    setNoteText("");
  });

  const addVideoNode = (url, left = 200, top = 200) => {
    if (!canvas) return;

    const rect = new fabric.Rect({
      width: 300,
      height: 200,
      fill: "#000",
      left,
      top,
    });

    rect.customType = "video";
    rect.videoUrl = url;
    rect.id = Date.now().toString();

    addToCanvas(rect);
  };


  const addConnector = whenReady(() => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
      addToCanvas(nodes);
    }
  });

  const defaultLayout = {
    leftOpen: true,
    rightOpen: true,
    leftWidth: 280,
    rightWidth: 300,
    dock: "default"
  };

  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  useEffect(() => {
    localStorage.setItem("canvas-layout", JSON.stringify(layout));
  }, [layout]);

  const startResize = (e, side) => {
    const startX = e.clientX;

    const move = (eMove) => {
      const delta = eMove.clientX - startX;
      setLayout(prev => ({
        ...prev,
        leftWidth:
          side === "left"
            ? Math.max(200, prev.leftWidth + delta)
            : prev.leftWidth
      }));
    };

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };


  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;

    const pointer = canvas.getPointer(e);
    const files = e.dataTransfer.files;

    for (let file of files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);

      if (file.type.startsWith("image/")) {
        const img = await createImageNode(url);
        img.set({ left: pointer.x, top: pointer.y });
        addToCanvas(img);
      } else if (file.type.startsWith("video/")) {
        addVideoNode(url, pointer.x, pointer.y);
      }
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
    if (!canvas) return;

    const snap = (e) => {
      const obj = e.target;
      obj.set({
        left: Math.round(obj.left / 10) * 10,
        top: Math.round(obj.top / 10) * 10,
      });
    };

    canvas.on("object:moving", snap);
    return () => canvas.off("object:moving", snap);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    const handleMove = (e) => {
      const pointer = canvas.getPointer(e.e);

      socket.emit("cursor-move", {
        roomId,
        cursor: {
          x: pointer.x,
          y: pointer.y,
          name: currentUser.name,
          color: currentUser.color
        }
      });
    };

    canvas.on("mouse:move", handleMove);
    canvas.on("object:moving", function(e) {
      const obj = e.target;

      obj.set({
        left: Math.round(obj.left / 10) * 10,
        top: Math.round(obj.top / 10) * 10
      });
    });

    canvas.on("object:moving", function(e) {
  const obj = e.target;

  canvas.getObjects().forEach(other => {
      if (other === obj) return;

      if (Math.abs(obj.left - other.left) < 5) {
        obj.set({ left: other.left });
      }

      if (Math.abs(obj.top - other.top) < 5) {
        obj.set({ top: other.top });
      }
    });
  });

    return () => canvas.off("mouse:move", handleMove);
  }, [canvas]);

  
  
  useEffect(() => {
    if (!canvas || !socket) return;

    const move = (e) => {
      const p = canvas.getPointer(e.e);
      socket.emit("cursor-move", {
        canvasId: roomId,
        cursor: { x: p.x, y: p.y, name: user?.name, color: "#4A90E2" },
      });
    };

    canvas.on("mouse:move", move);
    return () => canvas.off("mouse:move", move);
  }, [canvas, socket, roomId, user]);

  
  const groupSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length < 2) return;

    const group = new fabric.Group(active);
    canvas.discardActiveObject();
    active.forEach((o) => canvas.remove(o));
    addToCanvas(group);
  };

  const ungroupSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "group") return;

    const items = active._objects;
    canvas.remove(active);
    items.forEach((o) => canvas.add(o));
    canvas.requestRenderAll();
  };

  useEffect(() => {
    if (!canvas) return;

    canvas.on("object:selected", (e) => {
      const obj = e.target;
      obj.set({
        cornerStyle: "circle",
        cornerColor: "#4A90E2",
        borderColor: "#4A90E2",
        cornerSize: 10,
        transparentCorners: false,
        lockRotation: true,
      });
      canvas.hoverCursor = "grab";
    });

    canvas.on("before:transform", (e) => {
      const obj = e.target;
      canvas.hoverCursor = obj?.isMoving ? "grabbing" : "grab";
    });

    canvas.on("mouse:up", () => {
      canvas.hoverCursor = "grab";
    });

  }, [canvas]);


  const autoLayoutVertical = () => {
    if (!canvas) return;
    const objs = canvas.getActiveObjects();
    let y = 100;

    objs.forEach((o) => {
      o.set({ left: 200, top: y });
      y += o.height + 20;
    });

    canvas.requestRenderAll();
  };


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

  const replayHighlights = () => {
    if (!canvas) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= activityLogs.length) return clearInterval(interval);
      const log = activityLogs[i];
      const obj = canvas.getObjects().find(o => o.id === log.id);
      if (obj) {
        const origColor = obj.stroke || "#000";
        obj.set({ stroke: "red" });
        canvas.requestRenderAll();
        setTimeout(() => {
          obj.set({ stroke: origColor });
          canvas.requestRenderAll();
        }, 500);
      }
      i++;
    }, 700);
  };


  return (
    <div className="canvas-page">


      
      <div className="canvas-topbar">
        <div className="topbar-left" style={{marginTop:'5%'}}>
          <button onClick={() => setLeftOpen(v => !v)} style={{marginTop:'0'}}>☰</button>
          <button onClick={replayHighlights}>Play History</button>
          <h4 >Canvas Room: {roomId}</h4>
        </div>
        <h4 >Canvas Room: {roomId}</h4>

        <div className="topbar-center">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </div>
          ))}
        </div>

        <div className="topbar-right">
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
          <button onClick={() => setRightOpen(v => !v)}>⚙</button>
        </div>
      </div>


     <div className="canvas-workspace">     


        {leftOpen && (
          <div className="sidebar left">

            <div className="sidebar-tabs">
              <button
                className={leftTab === "tools" ? "active" : ""}
                onClick={() => setLeftTab("tools")}
              >
                Tools
              </button>

              <button
                className={leftTab === "layers" ? "active" : ""}
                onClick={() => setLeftTab("layers")}
              >
                Layers
              </button>
            </div>

            <div className="sidebar-content">

 
              {leftTab === "tools" && (
                <>
                  <div className="tool-grid">
                    {TOOLS.map(t => (
                      <button
                        key={t}
                        className={tool === t ? "active" : ""}
                        onClick={() => {
                          setTool(t)
                          canvas?.setActiveTool?.(t)
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <hr />

                  <button onClick={addTextNode}>Add Text</button>
                  <button onClick={addParagraphNode}>Add Paragraph</button>
                  <button onClick={addChecklistNode}>Add Checklist</button>
                  <button onClick={() => addImageNode("https://via.placeholder.com/150")}>
                    Add Image
                  </button>
                  <button onClick={addTaskCardNode}>Add Task Card</button>
                  <button onClick={addConnector}>Connector</button>
                </>
              )}


              {leftTab === "layers" && (
                <>
                  {canvas?.getObjects()?.map(o => (
                    <div
                      key={o.id}
                      className="layer-item"
                      onClick={() => openLayerModal(o)}
                    >
                      {o.type}
                    </div>
                  ))}
                  <LayerPanel />
                </>
              )}

            </div>
          </div>
        )}



        <div
          className="canvas-wrapper"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          
   
          <canvas
            id="canvas"
            className="fabric-canvas" 
          />

          {canvasReady && (
            <>
              <button onClick={() => setShowFloatingLayers(v => !v)}>Toggle Layers</button>
              {showFloatingLayers && <FloatingLayer />}
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CanvasVideoOverlay canvas={canvas} />
              {socket && <CollaborativeCursors socket={socket} />}
            </>
          )}

          {!canvasReady && (
            <div className="canvas-loading">
              Initialising canvas…
            </div>
          )}
        </div>
        
        
        {rightOpen && (
          <div className="sidebar right">

            <div className="sidebar-tabs">
              <button
                className={rightTab === "properties" ? "active" : ""}
                onClick={() => setRightTab("properties")}
              >
                Properties
              </button>

              <button
                className={rightTab === "zoom" ? "active" : ""}
                onClick={() => setRightTab("zoom")}
              >
                Zoom
              </button>

              <button
                className={rightTab === "minimap" ? "active" : ""}
                onClick={() => setRightTab("minimap")}
              >
                Minimap
              </button>
              <button
                className={rightTab === "timeline" ? "active" : ""}
                onClick={() => setRightTab("timeline")}
              >
                Timeline
              </button>
              <button
                className={rightTab === "live" ? "active" : ""}
                onClick={() => setRightTab("live")}
              >
                Live
              </button>
            </div>

            <div className="sidebar-content">
              {rightTab === "properties" && (
                <>
                  <NodePropertiesPanel canvas={canvas} />
                  <hr />
                  <button onClick={groupSelected}>Group</button>
                  <button onClick={ungroupSelected}>Ungroup</button>
                  <button onClick={autoLayoutVertical}>Auto Layout</button>
                </>
              )}

              {rightTab === "zoom" && <ZoomControls />}
              {rightTab === "minimap" && <MiniMap />}
              {rightTab === "timeline" && <MiniMapTimeline />}
              {rightTab === "live" && <MiniMapLive />}
            </div>

          </div>
        )}

      </div>


      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.object && (
            <>
              <div onClick={() => contextMenu.object.bringToFront()}>
                Bring Front
              </div>
              <div onClick={() => contextMenu.object.sendToBack()}>
                Send Back
              </div>
              <div
                onClick={() => {
                  canvas.remove(contextMenu.object);
                  setContextMenu(null);
                }}
              >
                Delete
              </div>
            </>
          )}
        </div>
      )}
      

    <ContextMenu
      data={contextMenu}
      onClose={() => setContextMenu(null)}
    />

    <FilePreviewModal
      file={previewFile}
      open={!!previewFile}
      onClose={() => setPreviewFile(null)}
    />

    <LayerDetailsModal
      object={selectedObject}
      open={layerModalOpen}
      onClose={() => setLayerModalOpen(false)}
      onDelete={handleDeleteObject}
    />

    <CommandPalette
      open={commandOpen}
      onClose={() => setCommandOpen(false)}
      canvas={canvas}
      addTextNode={addTextNode}
      groupSelected={groupSelected}
      autoLayoutVertical={autoLayoutVertical}
    />
    </div>
  );
}
*/



/*
// frontend/src/component/canvas/MyCanvasPage.jsx
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "./FloatingLayer";
import CanvasToolbar from "./CanvasToolbar";
import {
  createTextNode,
  createImageNode,
  createTaskCardNode,
} from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";

const TOOLS = [
  "select", "rect", "circle", "diamond", "line", "arrow", "pen",
  "connector", "text", "file", "url", "task"
];

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes } = useContext(CanvasContext);
  const socket  = useSocket();
  const { user } = useAuth();
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");

  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [tabs, setTabs] = useState([{ id: roomId, name: "Board 1" }]);
  const [activeTab, setActiveTab] = useState(roomId);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);

  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  useEffect(() => {
    if (canvas) setCanvasReady(true);
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

  useCanvasEngine(roomId);

  const logActivity = (text) => setActivityLogs(prev => [...prev, { text, time: Date.now() }]);

  // ── Canvas object selection ─────────────────────────────
  useEffect(() => {
    if (!canvas) return;

    const onObjectSelected = (e) => {
      const obj = e.target;
      if (!obj) return;
      setSelectedObject(obj);
      setLayerModalOpen(true);
      // no addToCanvas here! avoids duplicate objects
    };

    canvas.on("object:selected", onObjectSelected);
    canvas.on("mouse:dblclick", onObjectSelected);

    return () => {
      canvas.off("object:selected", onObjectSelected);
      canvas.off("mouse:dblclick", onObjectSelected);
    };
  }, [canvas]);

  // ── Add objects to canvas ───────────────────────────────
  const addToCanvas = useCallback(
    (obj) => {
      if (!canvas) return;
      obj.id = obj.id || Date.now().toString();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    },
    [canvas]
  );

  // ── Node factories ──────────────────────────────────────
  const addTextNode = useCallback(() => {
    if (!canvas) return;
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addParagraphNode = useCallback(() => {
    if (!canvas) return;
    const node = createTextNode("This is a paragraph.\nYou can edit it.");
    node.set({ left: 300, top: 100, width: 200, fontSize: 14 });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addChecklistNode = useCallback(() => {
    if (!canvas) return;
    const node = createTextNode("- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3");
    node.set({ left: 100, top: 250, width: 180, fontSize: 14, fill: "#333" });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addTaskCardNode = useCallback(() => {
    if (!canvas) return;
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    addToCanvas(node);
  }, [canvas, addToCanvas]);

  const addImageNode = useCallback(async (url) => {
    if (!canvas) return;
    const img = await createImageNode(url);
    img.set({ left: 250, top: 200 });
    addToCanvas(img);
  }, [canvas, addToCanvas]);

  // ── Drag & drop file import ─────────────────────────────
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;
    const pointer = canvas.getPointer(e);
    for (let file of e.dataTransfer.files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);
      if (file.type.startsWith("image/")) {
        const img = await createImageNode(url);
        img.set({ left: pointer.x, top: pointer.y });
        addToCanvas(img);
      } else if (file.type.startsWith("video/")) {
        const rect = new fabric.Rect({
          width: 300, height: 200, fill: "#000",
          left: pointer.x, top: pointer.y,
        });
        rect.customType = "video";
        rect.videoUrl = url;
        rect.id = Date.now().toString();
        addToCanvas(rect);
      }
    }
  };

  // ── Layout and resize ──────────────────────────────────
  const defaultLayout = { leftOpen: true, rightOpen: true, leftWidth: 280, rightWidth: 300 };
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  useEffect(() => { localStorage.setItem("canvas-layout", JSON.stringify(layout)); }, [layout]);

  const startResize = (e, side) => {
    const startX = e.clientX;
    const move = (eMove) => setLayout(prev => ({ ...prev, leftWidth: Math.max(200, prev.leftWidth + (side === "left" ? eMove.clientX - startX : 0)) }));
    const stop = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", stop); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };

  return (
    <div className="canvas-page">
      <div className="canvas-topbar">
        <div className="topbar-left">
          <button onClick={() => setLeftOpen(v => !v)}>☰</button>
          <button onClick={() => setRightOpen(v => !v)}>⚙</button>
        </div>
        <div className="topbar-center">
          {tabs.map(tab => (
            <div key={tab.id} className={`tab ${activeTab===tab.id?"active":""}`} onClick={()=>setActiveTab(tab.id)}>
              {tab.name}
            </div>
          ))}
        </div>
        <div className="topbar-right">
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
          <ZoomControls />
        </div>
      </div>

      <div className="canvas-workspace">
        {leftOpen && (
          <div className="sidebar left" style={{ width: layout.leftWidth }}>
            <div className="sidebar-tabs">
              <button className={leftTab==="tools"?"active":""} onClick={()=>setLeftTab("tools")}>Tools</button>
              <button className={leftTab==="layers"?"active":""} onClick={()=>setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content">
              {leftTab==="tools" && (
                <>
                  <div className="tool-grid">
                    {TOOLS.map(t=>(
                      <button key={t} className={tool===t?"active":""} onClick={()=>{setTool(t); canvas?.setActiveTool?.(t)}}>{t}</button>
                    ))}
                  </div>
                  <hr />
                  <button onClick={addTextNode}>Add Text</button>
                  <button onClick={addParagraphNode}>Add Paragraph</button>
                  <button onClick={addChecklistNode}>Add Checklist</button>
                  <button onClick={()=>addImageNode("https://via.placeholder.com/150")}>Add Image</button>
                  <button onClick={addTaskCardNode}>Add Task Card</button>
                </>
              )}
              {leftTab==="layers" && <LayerPanel canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} />}
            </div>
          </div>
        )}

        <div className="canvas-wrapper" onDragOver={e=>e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && <>
            {showFloatingLayers && <FloatingLayer />}
            <CanvasVideoOverlay canvas={canvas} />
            {socket && <CollaborativeCursors socket={socket} />}
          </>}
        </div>

        {rightOpen && (
          <div className="sidebar right" style={{ width: layout.rightWidth }}>
            <div className="sidebar-tabs">
              <button className={rightTab==="properties"?"active":""} onClick={()=>setRightTab("properties")}>Properties</button>
              <button className={rightTab==="zoom"?"active":""} onClick={()=>setRightTab("zoom")}>Zoom</button>
              <button className={rightTab==="minimap"?"active":""} onClick={()=>setRightTab("minimap")}>Minimap</button>
            </div>
            <div className="sidebar-content">
              {rightTab==="properties" && <NodePropertiesPanel canvas={canvas} />}
              {rightTab==="zoom" && <ZoomControls />}
              {rightTab==="minimap" && <MiniMap />}
            </div>
          </div>
        )}

      </div>

      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={()=>setLayerModalOpen(false)} onDelete={(obj)=>canvas.remove(obj)} />
      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={()=>setPreviewFile(null)} />
      <CommandPalette open={commandOpen} onClose={()=>setCommandOpen(false)} canvas={canvas} addTextNode={addTextNode} />
    </div>
  );
}
*/


/*
// frontend/src/component/canvas/MyCanvasPage.jsx
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import {
  createTextNode,
  createImageNode,
  createTaskCardNode,
} from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";

import LayerDetailsModal from "./LayerDetailsModal";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";

import "./my-canvas-page.css";

const TOOLS = [
  "select", "rect", "circle", "diamond", "line", "arrow", "pen",
  "connector", "text", "file", "url", "task"
];

export default function MyCanvasPage({ channelId: channelIdProp }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes, setNodes } = useContext(CanvasContext);
  const socket  = useSocket();
  const { user } = useAuth();
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");
  const [canvasReady, setCanvasReady] = useState(false);

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");

  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [activityLogs, setActivityLogs] = useState([]);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);

  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  const logActivity = (text) => {
    setActivityLogs(prev => [...prev, { text, time: Date.now() }]);
  };

  // ── Initialize Canvas Engine
  useCanvasEngine(roomId);

  // ── Canvas ready state
  useEffect(() => { if(canvas) setCanvasReady(true); }, [canvas]);

  // ── Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if(e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Selection on double-click
  useEffect(() => {
    if(!canvas) return;
    const handleSelection = (e) => {
      if(!e.target) return;
      setSelectedObject(e.target);
      setLayerModalOpen(true);
    };
    canvas.on("mouse:dblclick", handleSelection);
    return () => canvas.off("mouse:dblclick", handleSelection);
  }, [canvas]);

  // ── Context menu
  useEffect(() => {
    if(!canvas) return;
    const handler = (opt) => {
      if(opt.e.button !== 2) return;
      opt.e.preventDefault();
      setContextMenu({
        x: opt.e.clientX,
        y: opt.e.clientY,
        object: opt.target,
      });
    };
    canvas.on("mouse:down", handler);
    return () => canvas.off("mouse:down", handler);
  }, [canvas]);

  // ── Snap objects to 10px grid
  useEffect(() => {
    if(!canvas) return;
    const snap = (e) => {
      const obj = e.target;
      obj.set({
        left: Math.round(obj.left/10)*10,
        top: Math.round(obj.top/10)*10,
      });
    };
    canvas.on("object:moving", snap);
    return () => canvas.off("object:moving", snap);
  }, [canvas]);

  // ── Collaborative cursor movement
  useEffect(() => {
    if(!canvas || !socket || !user) return;
    const move = (e) => {
      const p = canvas.getPointer(e.e);
      socket.emit("cursor-move", {
        canvasId: roomId,
        cursor: { x: p.x, y: p.y, name: user.name, color: "#4A90E2" },
      });
    };
    canvas.on("mouse:move", move);
    return () => canvas.off("mouse:move", move);
  }, [canvas, socket, roomId, user]);

  // ── Node factories
  const addToCanvas = useCallback((obj) => {
    if(!canvas) return;
    obj.id = obj.id || Date.now().toString();
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }, [canvas]);

  const addTextNode = () => addToCanvas(createTextNode("Hello World"));
  const addParagraphNode = () => addToCanvas(createTextNode("Paragraph\nMulti-line"));
  const addChecklistNode = () => addToCanvas(createTextNode("- [ ] Item 1\n- [ ] Item 2"));
  const addImageNode = async (url) => addToCanvas(await createImageNode(url));
  const addTaskCardNode = () => addToCanvas(createTaskCardNode("Task Card Example"));
  const addConnector = () => {
    if(nodes.length >= 2) connectNodes(canvas, nodes[nodes.length-2], nodes[nodes.length-1]);
  };

  // ── Group/Ungroup
  const groupSelected = () => {
    const active = canvas.getActiveObjects();
    if(active.length < 2) return;
    const group = new fabric.Group(active);
    canvas.discardActiveObject();
    active.forEach(o => canvas.remove(o));
    addToCanvas(group);
  };

  const ungroupSelected = () => {
    const active = canvas.getActiveObject();
    if(!active || active.type !== "group") return;
    const items = active._objects;
    canvas.remove(active);
    items.forEach(o => canvas.add(o));
    canvas.requestRenderAll();
  };

  // ── Auto layout
  const autoLayoutVertical = () => {
    const objs = canvas.getActiveObjects();
    let y = 100;
    objs.forEach(o => { o.set({ left: 200, top: y }); y+=o.height+20; });
    canvas.requestRenderAll();
  };

  // ── Drag & drop files
  const handleDrop = async (e) => {
    e.preventDefault();
    const pointer = canvas.getPointer(e);
    for(let file of e.dataTransfer.files){
      const url = URL.createObjectURL(file);
      if(file.type.startsWith("image/")) addToCanvas(await createImageNode(url));
      else if(file.type.startsWith("video/")) {
        const rect = new fabric.Rect({ width: 300, height: 200, fill:"#000", left:pointer.x, top:pointer.y });
        rect.customType="video"; rect.videoUrl=url; rect.id=Date.now().toString();
        addToCanvas(rect);
      }
      setPreviewFile(file);
    }
  };

  // ── Layout
  const [layout, setLayout] = useState({ leftOpen:true, rightOpen:true, leftWidth:280, rightWidth:300 });
  const startResize = (e, side) => {
    const startX = e.clientX;
    const move = (ev) => {
      const delta = ev.clientX-startX;
      setLayout(prev => ({ ...prev, leftWidth: Math.max(200, prev.leftWidth + (side==="left"?delta:0)) }));
    };
    const stop = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", stop); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", stop);
  };

  // ── Delete object handler
  const handleDeleteObject = (obj) => {
    if(!canvas || !obj) return;
    canvas.remove(obj);
    canvas.requestRenderAll();
    logActivity(`Deleted ${obj.customType||obj.type}`);
  };

  return (
    <div className="canvas-page">
   
      <div className="canvas-topbar">
        <div className="topbar-left">
          <button onClick={()=>setLeftOpen(v=>!v)}>☰</button>
          <button onClick={()=>canvas?.undo?.()}>Undo</button>
          <button onClick={()=>canvas?.redo?.()}>Redo</button>
        </div>
        <h4>Canvas Room: {roomId}</h4>
        <div className="topbar-right">
          <button onClick={replayHighlights}>Play History</button>
          <button onClick={()=>setRightOpen(v=>!v)}>⚙</button>
        </div>
      </div>


      <div className="canvas-workspace">
     
        {leftOpen && (
          <div className="sidebar left" style={{ width: layout.leftWidth }}>
            <div className="sidebar-tabs">
              <button className={leftTab==="tools"?"active":""} onClick={()=>setLeftTab("tools")}>Tools</button>
              <button className={leftTab==="layers"?"active":""} onClick={()=>setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content">
              {leftTab==="tools" && <>
                <div className="tool-grid">
                  {TOOLS.map(t=>(
                    <button key={t} className={tool===t?"active":""} onClick={()=>setTool(t)}>{t}</button>
                  ))}
                </div>
                <hr />
                <button onClick={addTextNode}>Add Text</button>
                <button onClick={addParagraphNode}>Add Paragraph</button>
                <button onClick={addChecklistNode}>Add Checklist</button>
                <button onClick={()=>addImageNode("https://via.placeholder.com/150")}>Add Image</button>
                <button onClick={addTaskCardNode}>Add Task Card</button>
                <button onClick={addConnector}>Connector</button>
              </>}
              {leftTab==="layers" && <LayerPanel canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity}/>}
            </div>
          </div>
        )}

    
        <div className="canvas-wrapper" onDragOver={(e)=>e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas"/>
          {canvasReady && <>
            <button onClick={()=>setShowFloatingLayers(v=>!v)}>Toggle Layers</button>
            {showFloatingLayers && <FloatingLayer />}
            <MiniMap />
            <MiniMapLive />
            <MiniMapTimeline />
            <ZoomControls />
            {socket && <CollaborativeCursors socket={socket}/>}
          </>}
          {!canvasReady && <div className="canvas-loading">Initialising canvas…</div>}
        </div>

     
        {rightOpen && (
          <div className="sidebar right" style={{ width: layout.rightWidth }}>
            <div className="sidebar-tabs">
              {["properties","zoom","minimap","timeline","live"].map(tab=>(
                <button key={tab} className={rightTab===tab?"active":""} onClick={()=>setRightTab(tab)}>
                  {tab.charAt(0).toUpperCase()+tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="sidebar-content">
              {rightTab==="properties" && <>
                <CanvasToolbar canvas={canvas}/>
                <hr/>
                <button onClick={groupSelected}>Group</button>
                <button onClick={ungroupSelected}>Ungroup</button>
                <button onClick={autoLayoutVertical}>Auto Layout</button>
              </>}
              {rightTab==="zoom" && <ZoomControls />}
              {rightTab==="minimap" && <MiniMap />}
              {rightTab==="timeline" && <MiniMapTimeline />}
              {rightTab==="live" && <MiniMapLive />}
            </div>
          </div>
        )}
      </div>

  
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={()=>setContextMenu(null)}>
          {contextMenu.object && <>
            <div onClick={()=>{ contextMenu.object.bringToFront(); logActivity(`${contextMenu.object.type} to front`); setContextMenu(null); }}>Bring Front</div>
            <div onClick={()=>{ contextMenu.object.sendToBack(); logActivity(`${contextMenu.object.type} to back`); setContextMenu(null); }}>Send Back</div>
            <div onClick={()=>{ toggleVisibility(contextMenu.object); setContextMenu(null); }}>Toggle Visibility</div>
            <div onClick={()=>{ toggleLock(contextMenu.object); setContextMenu(null); }}>Lock/Unlock</div>
            <div onClick={()=>{ handleDeleteObject(contextMenu.object); setContextMenu(null); }}>Delete</div>
          </>}
        </div>
      )}

      <LayerDetailsModal
        object={selectedObject}
        open={layerModalOpen}
        onClose={()=>setLayerModalOpen(false)}
        onDelete={handleDeleteObject}
      />

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
        groupSelected={groupSelected}
        autoLayoutVertical={autoLayoutVertical}
      />
    </div>
  );
}
*/




/* 
// frontend/src/component/canvas/MyCanvasPage.jsx
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import "./my-canvas-page.css";

const TOOLS = [
  "select", "rect", "circle", "diamond", "line", "arrow", "pen",
  "connector", "text", "file", "url", "task"
];

function ContextMenu({ data, onClose, canvas, logActivity }) {
  if (!data) return null;
  const { x, y, object } = data;

  const toggleVisibility = () => {
    object.visible = !object.visible;
    canvas.requestRenderAll();
    logActivity(`${object.type} visibility ${object.visible ? "shown" : "hidden"}`);
    onClose();
  };

  const toggleLock = () => {
    object.lockMovementX = !object.lockMovementX;
    object.lockMovementY = !object.lockMovementY;
    logActivity(`${object.type} ${object.lockMovementX ? "locked" : "unlocked"}`);
    onClose();
  };

  const bringFront = () => {
    object.bringToFront();
    canvas.requestRenderAll();
    logActivity(`${object.type} moved to front`);
    onClose();
  };

  const sendBack = () => {
    object.sendToBack();
    canvas.requestRenderAll();
    logActivity(`${object.type} moved to back`);
    onClose();
  };

  const deleteObject = () => {
    canvas.remove(object);
    canvas.requestRenderAll();
    logActivity(`Deleted ${object.type}`);
    onClose();
  };

  return (
    <div className="context-menu" style={{ top: y, left: x }} onMouseLeave={onClose}>
      <div onClick={bringFront}>Bring Front</div>
      <div onClick={sendBack}>Send Back</div>
      <div onClick={toggleVisibility}>Toggle Visibility</div>
      <div onClick={toggleLock}>Lock/Unlock</div>
      <div onClick={deleteObject}>Delete</div>
    </div>
  );
}

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes } = useContext(CanvasContext);
  const socket = useSocket();
  const { user } = useAuth();
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");
  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [tabs, setTabs] = useState([{ id: roomId, name: "Board 1" }]);
  const [activeTab, setActiveTab] = useState(roomId);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);

  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  const logActivity = (text) => {
    setActivityLogs(prev => [...prev, { text, time: Date.now() }]);
  };

  useEffect(() => { if (canvas) setCanvasReady(true); }, [canvas]);
  useCanvasEngine(roomId);

  const whenReady = (fn) => (...args) => { if (!canvas) return; fn(...args); };

  const addToCanvas = useCallback(
    (obj) => {
      if (!canvas) return;
      obj.id = obj.id || Date.now().toString();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      logActivity(`Added ${obj.type}`);
    },
    [canvas]
  );

  const addTextNodeHandler = () => { addToCanvas(createTextNode("Hello World").set({ left: 100, top: 100 })); };
  const addParagraphNodeHandler = () => addToCanvas(createTextNode("Paragraph example").set({ left: 300, top: 100, width: 200 }));
  const addChecklistNodeHandler = () => addToCanvas(createTextNode("- [ ] Item 1\n- [ ] Item 2").set({ left: 100, top: 250, width: 180 }));

  const addImageNodeHandler = async (url) => {
    const img = await createImageNode(url);
    img.set({ left: 200, top: 150 });
    addToCanvas(img);
  };

  const addTaskCardHandler = () => addToCanvas(createTaskCardNode("Task Card").set({ left: 200, top: 400 }));

  const addNote = () => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, { fill: "#222", fontSize: 14, width: 200 }).set({ left: 150, top: 550 });
    addToCanvas(note);
    setNoteText("");
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;
    const pointer = canvas.getPointer(e);
    const files = e.dataTransfer.files;

    for (let file of files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);
      if (file.type.startsWith("image/")) {
        const img = await createImageNode(url);
        img.set({ left: pointer.x, top: pointer.y });
        addToCanvas(img);
      } else if (file.type.startsWith("video/")) {
        const rect = new fabric.Rect({ width: 300, height: 200, fill: "#000", left: pointer.x, top: pointer.y });
        rect.customType = "video"; rect.videoUrl = url; rect.id = Date.now().toString();
        addToCanvas(rect);
      }
    }
  };

  const groupSelected = () => {
    const active = canvas.getActiveObjects();
    if (!active || active.length < 2) return;
    const group = new fabric.Group(active);
    canvas.discardActiveObject(); active.forEach(o => canvas.remove(o));
    addToCanvas(group);
    logActivity("Grouped objects");
  };

  const ungroupSelected = () => {
    const active = canvas.getActiveObject();
    if (!active || active.type !== "group") return;
    const items = active._objects;
    canvas.remove(active); items.forEach(o => canvas.add(o)); canvas.requestRenderAll();
    logActivity("Ungrouped objects");
  };

  const autoLayoutVertical = () => {
    const objs = canvas.getActiveObjects();
    let y = 100; objs.forEach(o => { o.set({ left: 200, top: y }); y += o.height + 20; });
    canvas.requestRenderAll();
    logActivity("Auto-layout applied");
  };

  useEffect(() => {
    if (!canvas) return;
    const snap = (e) => {
      const obj = e.target;
      obj.set({ left: Math.round(obj.left / 10) * 10, top: Math.round(obj.top / 10) * 10 });
    };
    canvas.on("object:moving", snap);
    return () => canvas.off("object:moving", snap);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const selectHandler = (e) => setSelectedObject(e.target);
    canvas.on("mouse:dblclick", selectHandler);
    return () => canvas.off("mouse:dblclick", selectHandler);
  }, [canvas]);

  const replayHighlights = () => {
    if (!canvas) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= activityLogs.length) return clearInterval(interval);
      const log = activityLogs[i];
      const obj = canvas.getObjects().find(o => o.id === log.id);
      if (obj) {
        const origColor = obj.stroke || "#000";
        obj.set({ stroke: "red" }); canvas.requestRenderAll();
        setTimeout(() => { obj.set({ stroke: origColor }); canvas.requestRenderAll(); }, 500);
      }
      i++;
    }, 700);
  };

  return (
    <div className="canvas-page">

  
      <div className="canvas-topbar">
        <div className="topbar-left">
          <button onClick={() => setLeftOpen(v => !v)}>☰</button>
          <button onClick={replayHighlights}>Play History</button>
          <h4>Canvas Room: {roomId}</h4>
        </div>
        <div className="topbar-right">
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
          <button onClick={() => setRightOpen(v => !v)}>⚙</button>
        </div>
      </div>

      <div className="canvas-workspace">
     
        {leftOpen && (
          <div className="sidebar left">
            <div className="sidebar-tabs">
              <button className={leftTab === "tools" ? "active" : ""} onClick={() => setLeftTab("tools")}>Tools</button>
              <button className={leftTab === "layers" ? "active" : ""} onClick={() => setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content">
              {leftTab === "tools" && (
                <>
                  <CanvasToolbar />
                  <button onClick={addTextNodeHandler}>Add Text</button>
                  <button onClick={addParagraphNodeHandler}>Add Paragraph</button>
                  <button onClick={addChecklistNodeHandler}>Add Checklist</button>
                  <button onClick={() => addImageNodeHandler("https://via.placeholder.com/150")}>Add Image</button>
                  <button onClick={addTaskCardHandler}>Add Task Card</button>
                  <button onClick={groupSelected}>Connector</button>
                </>
              )}
              {leftTab === "layers" && <LayerPanel canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} />}
            </div>
          </div>
        )}

  
        <div className="canvas-wrapper" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && (
            <>
              <button onClick={() => setShowFloatingLayers(v => !v)}>Toggle Layers</button>
              {showFloatingLayers && <FloatingLayer canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} />}
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CollaborativeCursors socket={socket} />
            </>
          )}
          {!canvasReady && <div className="canvas-loading">Initialising canvas…</div>}
        </div>

     
        {rightOpen && (
          <div className="sidebar right">
            <div className="sidebar-tabs">
              <button className={rightTab === "properties" ? "active" : ""} onClick={() => setRightTab("properties")}>Properties</button>
              <button className={rightTab === "zoom" ? "active" : ""} onClick={() => setRightTab("zoom")}>Zoom</button>
              <button className={rightTab === "minimap" ? "active" : ""} onClick={() => setRightTab("minimap")}>Minimap</button>
            </div>
            <div className="sidebar-content">
              {rightTab === "properties" && (
                <>
                  <NodePropertiesPanel canvas={canvas} />
                  <button onClick={groupSelected}>Group</button>
                  <button onClick={ungroupSelected}>Ungroup</button>
                  <button onClick={autoLayoutVertical}>Auto Layout</button>
                </>
              )}
              {rightTab === "zoom" && <ZoomControls />}
              {rightTab === "minimap" && <MiniMap />}
            </div>
          </div>
        )}

      </div>

      <ContextMenu data={contextMenu} onClose={() => setContextMenu(null)} canvas={canvas} logActivity={logActivity} />

      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={() => setLayerModalOpen(false)} onDelete={(obj) => { canvas.remove(obj); logActivity(`Deleted ${obj.type}`); }} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} canvas={canvas} addTextNode={addTextNodeHandler} groupSelected={groupSelected} autoLayoutVertical={autoLayoutVertical} />
    </div>
  );
}
*/





/*
// frontend/src/component/canvas/MyCanvasPage.jsx
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import MiniMapLive from "./MiniMapLive";
import MiniMapTimeline from "./MiniMapTimeline";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "../floating/FloatingLayer";
import CanvasToolbar from "./CanvasToolbar";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import "./canvas-page.css";

const TOOLS = [
  "select",
  "rect",
  "circle",
  "diamond",
  "line",
  "arrow",
  "pen",
  "connector",
  "text",
  "file",
  "url",
  "task",
];

export default function MyCanvasPage() {
  const { channelId } = useParams();
  const { canvas, nodes } = useContext(CanvasContext);

  // Use channelId as roomId so each channel gets its own collaborative room.
  // Falls back to "demo-room" if accessed outside a channel route.
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");

  // Boots Fabric canvas + Yjs CRDT + socket sync
  useCanvasEngine(roomId);

  // ── Guards — canvas may be null on first render ─────────────────────────────
  const whenReady = (fn) => (...args) => {
    if (!canvas) return;
    fn(...args);
  };

  // ── Node factories ───────────────────────────────────────────────────────────
  const addTextNode = whenReady(() => {
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    canvas.add(node);
  });

  const addParagraphNode = whenReady(() => {
    const node = createTextNode(
      "This is a paragraph with multiple lines.\nYou can edit it."
    );
    node.set({ left: 300, top: 100, width: 200, fontSize: 14 });
    canvas.add(node);
  });

  const addChecklistNode = whenReady(() => {
    const node = createTextNode("- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3");
    node.set({ left: 100, top: 250, width: 180, fontSize: 14, fill: "#333" });
    canvas.add(node);
  });

  const addImageNode = whenReady(() => {
    createImageNode("https://via.placeholder.com/150").then((img) => {
      img.set({ left: 350, top: 250 });
      canvas.add(img);
    });
  });

  const addTaskCardNode = whenReady(() => {
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    canvas.add(node);
  });

  const addNote = whenReady(() => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, { fill: "#222", fontSize: 14, width: 200 });
    note.set({ left: 150, top: 550 });
    canvas.add(note);
    setNoteText("");
  });

  const addConnector = whenReady(() => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
    }
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="canvas-page"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <CanvasToolbar />

      <div className="canvas-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <LayerPanel />

        <div style={{ flex: 1, position: "relative" }}>
   
          <canvas
            id="canvas"
            style={{ border: "1px solid #333", width: "100%", height: "100%" }}
          />

          <FloatingLayer />
          <MiniMap />
          <MiniMapLive />
          <MiniMapTimeline />
          <ZoomControls />

          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              maxWidth: 260,
              zIndex: 10,
            }}
          >
            {TOOLS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTool(t);
                  canvas?.setActiveTool?.(t);
                }}
                style={{
                  margin: 2,
                  fontWeight: tool === t ? "bold" : "normal",
                  outline: tool === t ? "2px solid #4A90E2" : "none",
                }}
              >
                {t}
              </button>
            ))}

            <hr style={{ width: "100%", margin: "6px 0" }} />

            <button onClick={() => canvas?.undo?.()}>Undo</button>
            <button onClick={() => canvas?.redo?.()}>Redo</button>
            <button onClick={addConnector}>Connector</button>
          </div>

          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 10,
            }}
          >
            <button onClick={addTextNode}>Add Text</button>
            <button onClick={addParagraphNode}>Add Paragraph</button>
            <button onClick={addChecklistNode}>Add Checklist</button>
            <button onClick={addImageNode}>Add Image</button>
            <button onClick={addTaskCardNode}>Add Task Card</button>

            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add note…"
                style={{ width: 130 }}
              />
              <button onClick={addNote}>Add</button>
            </div>
          </div>

      
          {!canvas && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.8)",
                zIndex: 20,
              }}
            >
              Initialising canvas…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
*/




/*
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import "./my-canvas-page.css";

const TOOLS = [
  "select", "rect", "circle", "diamond", "line", "arrow", "pen",
  "connector", "text", "file", "url", "task"
];

function ContextMenu({ data, onClose, canvas, logActivity }) {
  if (!data) return null;
  const { x, y, object } = data;

  const toggleVisibility = () => {
    object.visible = !object.visible;
    canvas.requestRenderAll();
    logActivity(`${object.type} visibility ${object.visible ? "shown" : "hidden"}`);
    onClose();
  };

  const toggleLock = () => {
    object.lockMovementX = !object.lockMovementX;
    object.lockMovementY = !object.lockMovementY;
    logActivity(`${object.type} ${object.lockMovementX ? "locked" : "unlocked"}`);
    onClose();
  };

  const bringFront = () => {
    object.bringToFront();
    canvas.requestRenderAll();
    logActivity(`${object.type} moved to front`);
    onClose();
  };

  const sendBack = () => {
    object.sendToBack();
    canvas.requestRenderAll();
    logActivity(`${object.type} moved to back`);
    onClose();
  };

  const deleteObject = () => {
    canvas.remove(object);
    canvas.requestRenderAll();
    logActivity(`Deleted ${object.type}`);
    onClose();
  };

  return (
    <div className="context-menu" style={{ top: y, left: x }} onMouseLeave={onClose}>
      <div onClick={bringFront}>Bring Front</div>
      <div onClick={sendBack}>Send Back</div>
      <div onClick={toggleVisibility}>Toggle Visibility</div>
      <div onClick={toggleLock}>Lock/Unlock</div>
      <div onClick={deleteObject}>Delete</div>
    </div>
  );
}

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes } = useContext(CanvasContext);
  const socket = useSocket();
  const { user } = useAuth();
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");
  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [tabs, setTabs] = useState([{ id: roomId, name: "Board 1" }]);
  const [activeTab, setActiveTab] = useState(roomId);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showFloatingLayers, setShowFloatingLayers] = useState(false);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);

  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  const logActivity = (text) => {
    setActivityLogs(prev => [...prev, { text, time: Date.now() }]);
  };

  useEffect(() => { if (canvas) setCanvasReady(true); }, [canvas]);
  useCanvasEngine(roomId);

  const whenReady = (fn) => (...args) => { if (!canvas) return; fn(...args); };

  const addToCanvas = useCallback(
    (obj) => {
      if (!canvas) return;
      obj.id = obj.id || Date.now().toString();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      logActivity(`Added ${obj.type}`);
    },
    [canvas]
  );

  const addTextNodeHandler = () => { addToCanvas(createTextNode("Hello World").set({ left: 100, top: 100 })); };
  const addParagraphNodeHandler = () => addToCanvas(createTextNode("Paragraph example").set({ left: 300, top: 100, width: 200 }));
  const addChecklistNodeHandler = () => addToCanvas(createTextNode("- [ ] Item 1\n- [ ] Item 2").set({ left: 100, top: 250, width: 180 }));

  const addImageNodeHandler = async (url) => {
    const img = await createImageNode(url);
    img.set({ left: 200, top: 150 });
    addToCanvas(img);
  };

  const addTaskCardHandler = () => addToCanvas(createTaskCardNode("Task Card").set({ left: 200, top: 400 }));

  const addNote = () => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, { fill: "#222", fontSize: 14, width: 200 }).set({ left: 150, top: 550 });
    addToCanvas(note);
    setNoteText("");
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;
    const pointer = canvas.getPointer(e);
    const files = e.dataTransfer.files;

    for (let file of files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);
      if (file.type.startsWith("image/")) {
        const img = await createImageNode(url);
        img.set({ left: pointer.x, top: pointer.y });
        addToCanvas(img);
      } else if (file.type.startsWith("video/")) {
        const rect = new fabric.Rect({ width: 300, height: 200, fill: "#000", left: pointer.x, top: pointer.y });
        rect.customType = "video"; rect.videoUrl = url; rect.id = Date.now().toString();
        addToCanvas(rect);
      }
    }
  };

  const groupSelected = () => {
    const active = canvas.getActiveObjects();
    if (!active || active.length < 2) return;
    const group = new fabric.Group(active);
    canvas.discardActiveObject(); active.forEach(o => canvas.remove(o));
    addToCanvas(group);
    logActivity("Grouped objects");
  };

  const ungroupSelected = () => {
    const active = canvas.getActiveObject();
    if (!active || active.type !== "group") return;
    const items = active._objects;
    canvas.remove(active); items.forEach(o => canvas.add(o)); canvas.requestRenderAll();
    logActivity("Ungrouped objects");
  };

  const autoLayoutVertical = () => {
    const objs = canvas.getActiveObjects();
    let y = 100; objs.forEach(o => { o.set({ left: 200, top: y }); y += o.height + 20; });
    canvas.requestRenderAll();
    logActivity("Auto-layout applied");
  };

  useEffect(() => {
    if (!canvas) return;
    const snap = (e) => {
      const obj = e.target;
      obj.set({ left: Math.round(obj.left / 10) * 10, top: Math.round(obj.top / 10) * 10 });
    };
    canvas.on("object:moving", snap);
    return () => canvas.off("object:moving", snap);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const selectHandler = (e) => setSelectedObject(e.target);
    canvas.on("mouse:dblclick", selectHandler);
    return () => canvas.off("mouse:dblclick", selectHandler);
  }, [canvas]);

  const replayHighlights = () => {
    if (!canvas) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= activityLogs.length) return clearInterval(interval);
      const log = activityLogs[i];
      const obj = canvas.getObjects().find(o => o.id === log.id);
      if (obj) {
        const origColor = obj.stroke || "#000";
        obj.set({ stroke: "red" }); canvas.requestRenderAll();
        setTimeout(() => { obj.set({ stroke: origColor }); canvas.requestRenderAll(); }, 500);
      }
      i++;
    }, 700);
  };

  return (
    <div className="canvas-page">

    
      <div className="canvas-topbar">
        <div className="topbar-left">
          <button onClick={() => setLeftOpen(v => !v)}>☰</button>
          <button onClick={replayHighlights}>Play History</button>
          <h4>Canvas Room: {roomId}</h4>
        </div>
        <div className="topbar-right">
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
          <button onClick={() => setRightOpen(v => !v)}>⚙</button>
        </div>
      </div>

      <div className="canvas-workspace">
     
        {leftOpen && (
          <div className="sidebar left">
            <div className="sidebar-tabs">
              <button className={leftTab === "tools" ? "active" : ""} onClick={() => setLeftTab("tools")}>Tools</button>
              <button className={leftTab === "layers" ? "active" : ""} onClick={() => setLeftTab("layers")}>Layers</button>
            </div>
            <div className="sidebar-content">
              {leftTab === "tools" && (
                <>
                  <CanvasToolbar />
                  <button onClick={addTextNodeHandler}>Add Text</button>
                  <button onClick={addParagraphNodeHandler}>Add Paragraph</button>
                  <button onClick={addChecklistNodeHandler}>Add Checklist</button>
                  <button onClick={() => addImageNodeHandler("https://via.placeholder.com/150")}>Add Image</button>
                  <button onClick={addTaskCardHandler}>Add Task Card</button>
                  <button onClick={groupSelected}>Connector</button>
                </>
              )}
              {leftTab === "layers" && <LayerPanel canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} />}
            </div>
          </div>
        )}

  
        <div className="canvas-wrapper" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && (
            <>
              <button onClick={() => setShowFloatingLayers(v => !v)}>Toggle Layers</button>
              {showFloatingLayers && <FloatingLayer canvas={canvas} openLayerModal={openLayerModal} logActivity={logActivity} />}
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CollaborativeCursors socket={socket} />
            </>
          )}
          {!canvasReady && <div className="canvas-loading">Initialising canvas…</div>}
        </div>

   
        {rightOpen && (
          <div className="sidebar right">
            <div className="sidebar-tabs">
              <button className={rightTab === "properties" ? "active" : ""} onClick={() => setRightTab("properties")}>Properties</button>
              <button className={rightTab === "zoom" ? "active" : ""} onClick={() => setRightTab("zoom")}>Zoom</button>
              <button className={rightTab === "minimap" ? "active" : ""} onClick={() => setRightTab("minimap")}>Minimap</button>
            </div>
            <div className="sidebar-content">
              {rightTab === "properties" && (
                <>
                  <NodePropertiesPanel canvas={canvas} />
                  <button onClick={groupSelected}>Group</button>
                  <button onClick={ungroupSelected}>Ungroup</button>
                  <button onClick={autoLayoutVertical}>Auto Layout</button>
                </>
              )}
              {rightTab === "zoom" && <ZoomControls />}
              {rightTab === "minimap" && <MiniMap />}
            </div>
          </div>
        )}

      </div>

      <ContextMenu data={contextMenu} onClose={() => setContextMenu(null)} canvas={canvas} logActivity={logActivity} />

      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={() => setLayerModalOpen(false)} onDelete={(obj) => { canvas.remove(obj); logActivity(`Deleted ${obj.type}`); }} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} canvas={canvas} addTextNode={addTextNodeHandler} groupSelected={groupSelected} autoLayoutVertical={autoLayoutVertical} />
    </div>
  );
}
*/




















/*
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import MiniMapLive from "./MiniMapLive";
import MiniMapTimeline from "./MiniMapTimeline";
import ZoomControls from "./ZoomControls";
import CanvasToolbar from "./CanvasToolbar";
import FloatingLayer from "./FloatingLayer";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import "./my-canvas-page.css";
import CanvasVideoOverlay from "./CanvasVideoOverlay";

const TOOLS = [
  "select", "rect", "circle", "diamond", "line", "arrow",
  "pen", "connector", "text", "file", "url", "task"
];

export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes } = useContext(CanvasContext);
  const socket  = useSocket();
  const { user } = useAuth();
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");
  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");
  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : { leftOpen: true, rightOpen: true, leftWidth: 280, rightWidth: 300, dock: "default" };
  });

  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  const logActivity = (text, obj = null) => {
    setActivityLogs(prev => [...prev, { text, time: Date.now(), id: obj?.id }]);
  };

  const whenReady = (fn) => (...args) => { if (canvas) fn(...args); };

  const addToCanvas = useCallback(
    (obj) => {
      if (!canvas) return;
      obj.id = obj.id || Date.now().toString();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      logActivity(`Created ${obj.customType || obj.type}`, obj);
    },
    [canvas]
  );

  // Initialize Fabric + Canvas Engine
  useCanvasEngine(roomId);

  useEffect(() => { if (canvas) setCanvasReady(true); }, [canvas]);

  // Keybinding for command palette
  useEffect(() => {
    const handler = (e) => { if (e.ctrlKey && e.key === "k") { e.preventDefault(); setCommandOpen(true); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ───────── Canvas Event Listeners ─────────
  useEffect(() => {
    if (!canvas) return;

    const handleMoveScaling = (e) => {
      const obj = e.target;
      if (!obj) return;

      logActivity(`Modified ${obj.customType || obj.type}`, obj);
    };

    canvas.on("object:modified", handleMoveScaling);

    canvas.on("object:moving", (e) => {
      const obj = e.target;
      canvas.hoverCursor = "grabbing";
      logActivity(`Moved ${obj.customType || obj.type}`, obj);
      obj.set({ left: Math.round(obj.left / 10) * 10, top: Math.round(obj.top / 10) * 10 });
    });

    canvas.on("object:scaling", (e) => {
      canvas.hoverCursor = "nwse-resize";
      const obj = e.target;
      logActivity(`Resized ${obj.customType || obj.type}`, obj);
    });

    canvas.on("mouse:up", () => canvas.hoverCursor = "grab");

    canvas.on("mouse:dblclick", (e) => { if (e.target) openLayerModal(e.target); });

    canvas.on("mouse:down", (e) => {
      if (e.e.button === 2) {
        e.e.preventDefault();
        setContextMenu({ x: e.e.clientX, y: e.e.clientY, object: e.target });
      }
    });

    return () => {
      canvas.off("object:modified", handleMoveScaling);
      canvas.off("object:moving");
      canvas.off("object:scaling");
      canvas.off("mouse:up");
      canvas.off("mouse:dblclick");
      canvas.off("mouse:down");
    };
  }, [canvas]);

  const handleDeleteObject = (obj) => {
    if (!canvas || !obj) return;
    canvas.remove(obj);
    canvas.requestRenderAll();
    logActivity(`Deleted ${obj.customType || obj.type}`, obj);
  };

  const replayHighlights = () => {
    if (!canvas) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= activityLogs.length) return clearInterval(interval);
      const log = activityLogs[i];
      const obj = canvas.getObjects().find(o => o.id === log.id);
      if (obj) {
        const orig = obj.stroke;
        obj.set({ stroke: "red" });
        canvas.requestRenderAll();
        setTimeout(() => { obj.set({ stroke: orig }); canvas.requestRenderAll(); }, 500);
      }
      i++;
    }, 700);
  };

  // ───────── Node Factories ─────────
  const addTextNode = whenReady(() => {
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    addToCanvas(node);
  });

  const addImageNode = whenReady(async (url) => {
    const img = await createImageNode(url);
    img.set({ left: 200, top: 150 });
    addToCanvas(img);
  });

  const addTaskCardNode = whenReady(() => {
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    addToCanvas(node);
  });

  const addNote = whenReady(() => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, { fill: "#222", fontSize: 14, width: 200 });
    note.set({ left: 150, top: 550 });
    addToCanvas(note);
    setNoteText("");
  });

  const addVideoNode = whenReady((url, left = 200, top = 200) => {
    const rect = new fabric.Rect({ width: 300, height: 200, fill: "#000", left, top });
    rect.customType = "video";
    rect.videoUrl = url;
    addToCanvas(rect);
  });

  const addConnector = whenReady(() => {
    if (nodes.length >= 2) connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
  });

  // ───────── Drag & Drop Files ─────────
  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;

    const pointer = canvas.getPointer(e);
    const files = e.dataTransfer.files;

    for (let file of files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);

      if (file.type.startsWith("image/")) addImageNode(url);
      else if (file.type.startsWith("video/")) addVideoNode(url, pointer.x, pointer.y);
      else {
        // Document / File Node
        const obj = new fabric.Rect({ left: pointer.x, top: pointer.y, width: 200, height: 50, fill: "#fff", stroke: "#999" });
        obj.customType = "document";
        obj.file = file;
        obj.label = file.name;
        addToCanvas(obj);
      }
    }
  };

  return (
    <div className="canvas-page">

      <div className="canvas-topbar">
        <div className="topbar-left">
          <button onClick={() => setLeftOpen(v => !v)}>☰</button>
          <h4>Canvas Room: {roomId}</h4>
        </div>
        <div className="topbar-center">
          <button onClick={replayHighlights}>Replay Highlights</button>
        </div>
        <div className="topbar-right">
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
          <button onClick={() => setRightOpen(v => !v)}>⚙</button>
        </div>
      </div>

      <div className="canvas-workspace">
        {leftOpen && <div className="sidebar left"><CanvasToolbar /><LayerPanel /></div>}
        <div className="canvas-wrapper" onDragOver={e => e.preventDefault()} onDrop={handleDrop}>
          <canvas id="canvas" className="fabric-canvas" />
          {canvasReady && (
            <>
              <FloatingLayer modalToggle />
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CanvasVideoOverlay canvas={canvas} />
              {socket && <CollaborativeCursors socket={socket} />}
            </>
          )}
        </div>
        {rightOpen && <div className="sidebar right"><NodePropertiesPanel canvas={canvas} /></div>}
      </div>

      <FilePreviewModal file={previewFile} open={!!previewFile} onClose={() => setPreviewFile(null)} />
      <LayerDetailsModal object={selectedObject} open={layerModalOpen} onClose={() => setLayerModalOpen(false)} onDelete={handleDeleteObject} />
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} canvas={canvas} addTextNode={addTextNode} />
    </div>
  );
}
*/





/*
import { useContext, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
import {
  createTextNode,
  createImageNode,
  createTaskCardNode,
} from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
 import "./my-canvas-page.css";
import CanvasVideoOverlay from "./CanvasVideoOverlay";
import NodePropertiesPanel from "./NodePropertiesPanel";
import FilePreviewModal from "./FilePreviewModal";
import CollaborativeCursors from "./CollaborativeCursors";
import CommandPalette from "./CommandPalette";
import LayerDetailsModal from "./LayerDetailsModal";

const TOOLS = [
  "select",
  "rect",
  "circle",
  "diamond",
  "line",
  "arrow",
  "pen",
  "connector",
  "text",
  "file",
  "url",
  "task",
];

function ContextMenu({ data, onClose }) {
  if (!data) return null;

  const { x, y, object } = data;

  return (
    <div
      className="context-menu"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      {object && (
        <>
          <div onClick={() => object.bringToFront()}>Bring Front</div>
          <div onClick={() => object.sendToBack()}>Send Back</div>
          <div onClick={() => {
            object.visible = !object.visible;
          }}>
            Toggle Visibility
          </div>
          <div onClick={() => {
            canvas.remove(object);
            onClose();
          }}>
            Delete
          </div>
        </>
      )}
    </div>
  );
}

// Props come from MyCanvasPageRoute (via useParams there).
// useParams() here is a fallback in case the page is used standalone.
export default function MyCanvasPage({ channelId: channelIdProp, projectId }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas, nodes } = useContext(CanvasContext);
  const socket  = useSocket();
  const { user } = useAuth();
  // Each channel gets its own collaborative room
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");
  const [canvasReady, setCanvasReady] = useState(false);

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");

  const [contextMenu, setContextMenu] = useState(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [tabs, setTabs] = useState([{ id: roomId, name: "Board 1" }]);
  const [activeTab, setActiveTab] = useState(roomId);

  const [activityLogs, setActivityLogs] = useState([]);

  const [showFloatingLayers, setShowFloatingLayers] = useState(false);

  const [selectedObject, setSelectedObject] = useState(null);
  const [layerModalOpen, setLayerModalOpen] = useState(false);

  const openLayerModal = (obj) => {
    setSelectedObject(obj);
    setLayerModalOpen(true);
  };

  // Track when canvas is truly ready
  useEffect(() => {
    if (canvas) setCanvasReady(true);
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

  

  // Boot Fabric + Yjs CRDT + socket sync
  useCanvasEngine(roomId);
  // useCanvasEngine(activeTab);

  const logActivity = (text) => {
    setActivityLogs(prev => [...prev, { text, time: Date.now() }]);
  };

  useEffect(() => {
    if (!canvas) return;

    const handleSelection = (e) => {
      if (!e.target) return;
      setSelectedObject(e.target);
      setLayerModalOpen(true);
    };

    canvas.on("mouse:dblclick", handleSelection); // double-click on object
    return () => canvas.off("mouse:dblclick", handleSelection);
  }, [canvas]);

  const handleDeleteObject = (obj) => {
    if (!canvas || !obj) return;
    canvas.remove(obj);
    canvas.requestRenderAll();
    logActivity(`Deleted ${obj.customType || obj.type}`);
  };

  // ── Guard: silently no-op if canvas not yet initialised ────────────────────
  const whenReady = (fn) =>
    (...args) => {
      if (!canvas) return;
      fn(...args);
    };

  
  // add to canvas

  const addToCanvas = useCallback(
    (obj) => {
      if (!canvas) return;
      obj.id = obj.id || Date.now().toString();
      canvas.add(obj);
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    },
    [canvas]
  );

  useEffect(() => {
  if (!canvas) return;

  canvas.on("mouse:down", function(opt) {
      if (opt.e.button === 2) {
        opt.e.preventDefault();

        const obj = opt.target;

        setContextMenu({
          x: opt.e.clientX,
          y: opt.e.clientY,
          object: obj
        });
      }
    });

  }, [canvas]);

  // ── Node factories ──────────────────────────────────────────────────────────

  const addTextNode = async () => {
    if (!canvas) return;
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    addToCanvas(node);
  };

  const addParagraphNode = whenReady(() => {
    const node = createTextNode(
      "This is a paragraph with multiple lines.\nYou can edit it."
    );
    node.set({ left: 300, top: 100, width: 200, fontSize: 14 });
    // canvas.add(node);
    addToCanvas(node);
  });

  const addChecklistNode = whenReady(() => {
    const node = createTextNode(
      "- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3"
    );
    node.set({ left: 100, top: 250, width: 180, fontSize: 14, fill: "#333" });
    // canvas.add(node);
    addToCanvas(node);
  });

  const addImageNode = async (url) => {
    if (!canvas) return;
    const img = await createImageNode(url);
    img.set({ left: 200, top: 150 });
    canvas.add(img);
    logActivity(`Added image (${img.id})`);
  };

  const addPhotoNode = whenReady(async (fileUrl) => {
    const img = await createImageNode(fileUrl);
    img.set({ left: 250, top: 200 });
    addToCanvas(img);
  });

  const addTaskCardNode = whenReady(() => {
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    // canvas.add(node);
    addToCanvas(node);
  });

  const addNote = whenReady(() => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, {
      fill: "#222",
      fontSize: 14,
      width: 200,
    });
    note.set({ left: 150, top: 550 });
    // canvas.add(note);
    addToCanvas(node);
    setNoteText("");
  });

  const addVideoNode = (url, left = 200, top = 200) => {
    if (!canvas) return;

    const rect = new fabric.Rect({
      width: 300,
      height: 200,
      fill: "#000",
      left,
      top,
    });

    rect.customType = "video";
    rect.videoUrl = url;
    rect.id = Date.now().toString();

    addToCanvas(rect);
  };


  const addConnector = whenReady(() => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
      addToCanvas(nodes);
    }
  });

  const defaultLayout = {
    leftOpen: true,
    rightOpen: true,
    leftWidth: 280,
    rightWidth: 300,
    dock: "default"
  };

  const [layout, setLayout] = useState(() => {
    const saved = localStorage.getItem("canvas-layout");
    return saved ? JSON.parse(saved) : defaultLayout;
  });

  useEffect(() => {
    localStorage.setItem("canvas-layout", JSON.stringify(layout));
  }, [layout]);

  const startResize = (e, side) => {
    const startX = e.clientX;

    const move = (eMove) => {
      const delta = eMove.clientX - startX;
      setLayout(prev => ({
        ...prev,
        leftWidth:
          side === "left"
            ? Math.max(200, prev.leftWidth + delta)
            : prev.leftWidth
      }));
    };

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);
  };


  const handleDrop = async (e) => {
    e.preventDefault();
    if (!canvas) return;

    const pointer = canvas.getPointer(e);
    const files = e.dataTransfer.files;

    for (let file of files) {
      const url = URL.createObjectURL(file);
      setPreviewFile(file);

      if (file.type.startsWith("image/")) {
        const img = await createImageNode(url);
        img.set({ left: pointer.x, top: pointer.y });
        addToCanvas(img);
      } else if (file.type.startsWith("video/")) {
        addVideoNode(url, pointer.x, pointer.y);
      }
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
    if (!canvas) return;

    const snap = (e) => {
      const obj = e.target;
      obj.set({
        left: Math.round(obj.left / 10) * 10,
        top: Math.round(obj.top / 10) * 10,
      });
    };

    canvas.on("object:moving", snap);
    return () => canvas.off("object:moving", snap);
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;

    const handleMove = (e) => {
      const pointer = canvas.getPointer(e.e);

      socket.emit("cursor-move", {
        roomId,
        cursor: {
          x: pointer.x,
          y: pointer.y,
          name: currentUser.name,
          color: currentUser.color
        }
      });
    };

    canvas.on("mouse:move", handleMove);
    canvas.on("object:moving", function(e) {
      const obj = e.target;

      obj.set({
        left: Math.round(obj.left / 10) * 10,
        top: Math.round(obj.top / 10) * 10
      });
    });

    canvas.on("object:moving", function(e) {
  const obj = e.target;

  canvas.getObjects().forEach(other => {
      if (other === obj) return;

      if (Math.abs(obj.left - other.left) < 5) {
        obj.set({ left: other.left });
      }

      if (Math.abs(obj.top - other.top) < 5) {
        obj.set({ top: other.top });
      }
    });
  });

    return () => canvas.off("mouse:move", handleMove);
  }, [canvas]);

  
  
  useEffect(() => {
    if (!canvas || !socket) return;

    const move = (e) => {
      const p = canvas.getPointer(e.e);
      socket.emit("cursor-move", {
        canvasId: roomId,
        cursor: { x: p.x, y: p.y, name: user?.name, color: "#4A90E2" },
      });
    };

    canvas.on("mouse:move", move);
    return () => canvas.off("mouse:move", move);
  }, [canvas, socket, roomId, user]);

  
  const groupSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length < 2) return;

    const group = new fabric.Group(active);
    canvas.discardActiveObject();
    active.forEach((o) => canvas.remove(o));
    addToCanvas(group);
  };

  const ungroupSelected = () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== "group") return;

    const items = active._objects;
    canvas.remove(active);
    items.forEach((o) => canvas.add(o));
    canvas.requestRenderAll();
  };

  useEffect(() => {
    if (!canvas) return;

    canvas.on("object:selected", (e) => {
      const obj = e.target;
      obj.set({
        cornerStyle: "circle",
        cornerColor: "#4A90E2",
        borderColor: "#4A90E2",
        cornerSize: 10,
        transparentCorners: false,
        lockRotation: true,
      });
      canvas.hoverCursor = "grab";
    });

    canvas.on("before:transform", (e) => {
      const obj = e.target;
      canvas.hoverCursor = obj?.isMoving ? "grabbing" : "grab";
    });

    canvas.on("mouse:up", () => {
      canvas.hoverCursor = "grab";
    });

  }, [canvas]);


  const autoLayoutVertical = () => {
    if (!canvas) return;
    const objs = canvas.getActiveObjects();
    let y = 100;

    objs.forEach((o) => {
      o.set({ left: 200, top: y });
      y += o.height + 20;
    });

    canvas.requestRenderAll();
  };


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

  const replayHighlights = () => {
    if (!canvas) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i >= activityLogs.length) return clearInterval(interval);
      const log = activityLogs[i];
      const obj = canvas.getObjects().find(o => o.id === log.id);
      if (obj) {
        const origColor = obj.stroke || "#000";
        obj.set({ stroke: "red" });
        canvas.requestRenderAll();
        setTimeout(() => {
          obj.set({ stroke: origColor });
          canvas.requestRenderAll();
        }, 500);
      }
      i++;
    }, 700);
  };


  return (
    <div className="canvas-page">


      
      <div className="canvas-topbar">
        <div className="topbar-left" style={{marginTop:'5%'}}>
          <button onClick={() => setLeftOpen(v => !v)} style={{marginTop:'0'}}>☰</button>
          <button onClick={replayHighlights}>Play History</button>
          <h4 >Canvas Room: {roomId}</h4>
        </div>
        <h4 >Canvas Room: {roomId}</h4>

        <div className="topbar-center">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </div>
          ))}
        </div>

        <div className="topbar-right">
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
          <button onClick={() => setRightOpen(v => !v)}>⚙</button>
        </div>
      </div>


     


     <div className="canvas-workspace">

        
        


        {leftOpen && (
          <div className="sidebar left">

            <div className="sidebar-tabs">
              <button
                className={leftTab === "tools" ? "active" : ""}
                onClick={() => setLeftTab("tools")}
              >
                Tools
              </button>

              <button
                className={leftTab === "layers" ? "active" : ""}
                onClick={() => setLeftTab("layers")}
              >
                Layers
              </button>
            </div>

            <div className="sidebar-content">

 
              {leftTab === "tools" && (
                <>
                  <div className="tool-grid">
                    {TOOLS.map(t => (
                      <button
                        key={t}
                        className={tool === t ? "active" : ""}
                        onClick={() => {
                          setTool(t)
                          canvas?.setActiveTool?.(t)
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <hr />

                  <button onClick={addTextNode}>Add Text</button>
                  <button onClick={addParagraphNode}>Add Paragraph</button>
                  <button onClick={addChecklistNode}>Add Checklist</button>
                  <button onClick={() => addImageNode("https://via.placeholder.com/150")}>
                    Add Image
                  </button>
                  <button onClick={addTaskCardNode}>Add Task Card</button>
                  <button onClick={addConnector}>Connector</button>
                </>
              )}


              {leftTab === "layers" && (
                <>
                  {canvas?.getObjects()?.map(o => (
                    <div
                      key={o.id}
                      className="layer-item"
                      onClick={() => openLayerModal(o)}
                    >
                      {o.type}
                    </div>
                  ))}
                  <LayerPanel />
                </>
              )}

            </div>
          </div>
        )}



        <div
          className="canvas-wrapper"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          
   
          <canvas
            id="canvas"
            className="fabric-canvas" 
          />

          {canvasReady && (
            <>
              <button onClick={() => setShowFloatingLayers(v => !v)}>Toggle Layers</button>
              {showFloatingLayers && <FloatingLayer />}
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CanvasVideoOverlay canvas={canvas} />
              {socket && <CollaborativeCursors socket={socket} />}
            </>
          )}

          {!canvasReady && (
            <div className="canvas-loading">
              Initialising canvas…
            </div>
          )}
        </div>


   
        <div style={{ flex: 1, position: "relative" }}>
        <div
          className="canvas-wrapper"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >  
          <canvas
            id="canvas"
            style={{ border: "1px solid #333", width: "100%", height: "100%" }}
          />

     
          {canvasReady && (
            <>
              <FloatingLayer />
              <MiniMap />
              <MiniMapLive />
              <MiniMapTimeline />
              <ZoomControls />
              <CanvasVideoOverlay canvas={canvas} />
              {socket && <CollaborativeCursors socket={socket} />}
            </>
          )}

       
          {<div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              maxWidth: 260,
              zIndex: 10,
            }}
          >
            {TOOLS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTool(t);
                  canvas?.setActiveTool?.(t);
                }}
                style={{
                  margin: 2,
                  fontWeight: tool === t ? "bold" : "normal",
                  outline: tool === t ? "2px solid #4A90E2" : "none",
                }}
              >
                {t}
              </button>
            ))}

            <hr style={{ width: "100%", margin: "6px 0" }} />

          <button onClick={() => canvas?.undo?.()}>Undo</button>
            <button onClick={() => canvas?.redo?.()}>Redo</button>
            <button onClick={addConnector}>Connector</button>

          </div>}


          {<div
            style={{
              position: "absolute",
              top: 10,
              left: 270, // clear of LayerPanel (250px wide + gap)
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 10,
            }}
          >
            <button onClick={addTextNode}>Add Text</button>
            <button onClick={addParagraphNode}>Add Paragraph</button>
            <button onClick={addChecklistNode}>Add Checklist</button>
            <button onClick={addImageNode}>Add Image</button>
            <button onClick={addTaskCardNode}>Add Task Card</button>

            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add note…"
                style={{ width: 130 }}
              />
              <button onClick={addNote}>Add</button>
            </div>
          </div>}


          {!canvasReady && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.85)",
                zIndex: 20,
                fontSize: 16,
                color: "#555",
              }}
            >
              Initialising canvas…
            </div>
          )}
        </div>
        
        
       

        
        {rightOpen && (
          <div className="sidebar right">

            <div className="sidebar-tabs">
              <button
                className={rightTab === "zoom" ? "active" : ""}
                onClick={() => setRightTab("zoom")}
              >
                Zoom
              </button>
              <button
                className={rightTab === "minimap" ? "active" : ""}
                onClick={() => setRightTab("minimap")}
              >
                Minimap
              </button>
              <button
                className={rightTab === "timeline" ? "active" : ""}
                onClick={() => setRightTab("timeline")}
              >
                Timeline
              </button>
              <button
                className={rightTab === "live" ? "active" : ""}
                onClick={() => setRightTab("live")}
              >
                Live
              </button>
            </div>

            <div className="sidebar-content">
              {rightTab === "zoom" && <ZoomControls />}
              {rightTab === "minimap" && <MiniMap />}
              {rightTab === "timeline" && <MiniMapTimeline />}
              {rightTab === "live" && <MiniMapLive />}
            </div>

          </div>


        )}
        
   
        <div className="sidebar right">
          <NodePropertiesPanel canvas={canvas} />
          <button onClick={addTextNode}>Add Text</button>
          <button onClick={() => addImageNode("https://via.placeholder.com/150")}>
            Add Image
          </button>
          <button onClick={groupSelected}>Group</button>
          <button onClick={ungroupSelected}>Ungroup</button>
          <button onClick={autoLayoutVertical}>Auto Layout</button>
        </div>
        
        {rightOpen && (
          <div className="sidebar right">

            <div className="sidebar-tabs">
              <button
                className={rightTab === "properties" ? "active" : ""}
                onClick={() => setRightTab("properties")}
              >
                Properties
              </button>

              <button
                className={rightTab === "zoom" ? "active" : ""}
                onClick={() => setRightTab("zoom")}
              >
                Zoom
              </button>

              <button
                className={rightTab === "minimap" ? "active" : ""}
                onClick={() => setRightTab("minimap")}
              >
                Minimap
              </button>
            </div>

            <div className="sidebar-content">
              {rightTab === "properties" && (
                <>
                  <NodePropertiesPanel canvas={canvas} />
                  <hr />
                  <button onClick={groupSelected}>Group</button>
                  <button onClick={ungroupSelected}>Ungroup</button>
                  <button onClick={autoLayoutVertical}>Auto Layout</button>
                </>
              )}

              {rightTab === "zoom" && <ZoomControls />}
              {rightTab === "minimap" && <MiniMap />}
            </div>

          </div>
        )}

      </div>


      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          {contextMenu.object && (
            <>
              <div onClick={() => contextMenu.object.bringToFront()}>
                Bring Front
              </div>
              <div onClick={() => contextMenu.object.sendToBack()}>
                Send Back
              </div>
              <div
                onClick={() => {
                  canvas.remove(contextMenu.object);
                  setContextMenu(null);
                }}
              >
                Delete
              </div>
            </>
          )}
        </div>
      )}
      

    <ContextMenu
      data={contextMenu}
      onClose={() => setContextMenu(null)}
    />

    <FilePreviewModal
      file={previewFile}
      open={!!previewFile}
      onClose={() => setPreviewFile(null)}
    />

    <LayerDetailsModal
    object={selectedObject}
    open={layerModalOpen}
    onClose={() => setLayerModalOpen(false)}
    onDelete={handleDeleteObject}
  />

    <CommandPalette
      open={commandOpen}
      onClose={() => setCommandOpen(false)}
      canvas={canvas}
      addTextNode={addTextNode}
      groupSelected={groupSelected}
      autoLayoutVertical={autoLayoutVertical}
    />
    </div>
  );
}
*/







/*
// frontend/src/component/canvas/MyCanvasPage.jsx
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import MiniMapLive from "./MiniMapLive";
import MiniMapTimeline from "./MiniMapTimeline";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "../floating/FloatingLayer";
import CanvasToolbar from "./CanvasToolbar";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import "./canvas-page.css";

const TOOLS = [
  "select",
  "rect",
  "circle",
  "diamond",
  "line",
  "arrow",
  "pen",
  "connector",
  "text",
  "file",
  "url",
  "task",
];

export default function MyCanvasPage() {
  const { channelId } = useParams();
  const { canvas, nodes } = useContext(CanvasContext);

  // Use channelId as roomId so each channel gets its own collaborative room.
  // Falls back to "demo-room" if accessed outside a channel route.
  const roomId = channelId || "demo-room";

  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");

  // Boots Fabric canvas + Yjs CRDT + socket sync
  useCanvasEngine(roomId);

  // ── Guards — canvas may be null on first render ─────────────────────────────
  const whenReady = (fn) => (...args) => {
    if (!canvas) return;
    fn(...args);
  };

  // ── Node factories ───────────────────────────────────────────────────────────
  const addTextNode = whenReady(() => {
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    canvas.add(node);
  });

  const addParagraphNode = whenReady(() => {
    const node = createTextNode(
      "This is a paragraph with multiple lines.\nYou can edit it."
    );
    node.set({ left: 300, top: 100, width: 200, fontSize: 14 });
    canvas.add(node);
  });

  const addChecklistNode = whenReady(() => {
    const node = createTextNode("- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3");
    node.set({ left: 100, top: 250, width: 180, fontSize: 14, fill: "#333" });
    canvas.add(node);
  });

  const addImageNode = whenReady(() => {
    createImageNode("https://via.placeholder.com/150").then((img) => {
      img.set({ left: 350, top: 250 });
      canvas.add(img);
    });
  });

  const addTaskCardNode = whenReady(() => {
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    canvas.add(node);
  });

  const addNote = whenReady(() => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, { fill: "#222", fontSize: 14, width: 200 });
    note.set({ left: 150, top: 550 });
    canvas.add(note);
    setNoteText("");
  });

  const addConnector = whenReady(() => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
    }
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="canvas-page"
      style={{ display: "flex", flexDirection: "column", height: "100vh" }}
    >
      <CanvasToolbar />

      <div className="canvas-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <LayerPanel />

        <div style={{ flex: 1, position: "relative" }}>
   
          <canvas
            id="canvas"
            style={{ border: "1px solid #333", width: "100%", height: "100%" }}
          />

          <FloatingLayer />
          <MiniMap />
          <MiniMapLive />
          <MiniMapTimeline />
          <ZoomControls />

          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              maxWidth: 260,
              zIndex: 10,
            }}
          >
            {TOOLS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTool(t);
                  canvas?.setActiveTool?.(t);
                }}
                style={{
                  margin: 2,
                  fontWeight: tool === t ? "bold" : "normal",
                  outline: tool === t ? "2px solid #4A90E2" : "none",
                }}
              >
                {t}
              </button>
            ))}

            <hr style={{ width: "100%", margin: "6px 0" }} />

            <button onClick={() => canvas?.undo?.()}>Undo</button>
            <button onClick={() => canvas?.redo?.()}>Redo</button>
            <button onClick={addConnector}>Connector</button>
          </div>

          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 10,
            }}
          >
            <button onClick={addTextNode}>Add Text</button>
            <button onClick={addParagraphNode}>Add Paragraph</button>
            <button onClick={addChecklistNode}>Add Checklist</button>
            <button onClick={addImageNode}>Add Image</button>
            <button onClick={addTaskCardNode}>Add Task Card</button>

            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add note…"
                style={{ width: 130 }}
              />
              <button onClick={addNote}>Add</button>
            </div>
          </div>

      
          {!canvas && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.8)",
                zIndex: 20,
              }}
            >
              Initialising canvas…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
*/



/*
// frontend/src/component/canvas/MyCanvasPage.jsx
import React, { useEffect, useContext, useState } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import { fabric } from "fabric";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import MiniMapLive from "./MiniMapLive";
import MiniMapTimeline from "./MiniMapTimeline";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "../floating/FloatingLayer";
import CanvasToolbar from "./CanvasToolbar";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import "./canvas-page.css";

const TOOLS = [
  "select",
  "rect",
  "circle",
  "diamond",
  "line",
  "arrow",
  "pen",
  "connector",
  "text",
  "file",
  "url",
  "task",
];

export default function MyCanvasPage() {
  const { canvas, nodes } = useContext(CanvasContext);

  const [roomId] = useState("demo-room");
  const [tool, setTool] = useState("select");
  const [noteText, setNoteText] = useState("");

  // Single unified engine: Fabric + CRDT + Zoom/Pan + Undo/Redo + Tool handling
  useCanvasEngine(roomId);

  // ── Node factories ──────────────────────────────────────────────────────────

  const addTextNode = () => {
    const node = createTextNode("Hello World");
    node.set({ left: 100, top: 100 });
    canvas.add(node);
  };

  const addParagraphNode = () => {
    const node = createTextNode(
      "This is a paragraph with multiple lines.\nYou can edit it."
    );
    node.set({ left: 300, top: 100, width: 200, fontSize: 14 });
    canvas.add(node);
  };

  const addChecklistNode = () => {
    const node = createTextNode("- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3");
    node.set({ left: 100, top: 250, width: 180, fontSize: 14, fill: "#333" });
    canvas.add(node);
  };

  const addImageNode = () => {
    createImageNode("https://via.placeholder.com/150").then((img) => {
      img.set({ left: 350, top: 250 });
      canvas.add(img);
    });
  };

  const addTaskCardNode = () => {
    const node = createTaskCardNode("Task Card Example");
    node.set({ left: 200, top: 400 });
    canvas.add(node);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const note = createTextNode(noteText, { fill: "#222", fontSize: 14, width: 200 });
    note.set({ left: 150, top: 550 });
    canvas.add(note);
    setNoteText("");
  };

  // Add connector between the last two nodes
  const addConnector = () => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="canvas-page" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>

     
      <CanvasToolbar />

      <div className="canvas-body" style={{ display: "flex", flex: 1, overflow: "hidden" }}>

  
        <LayerPanel />

   
        <div style={{ flex: 1, position: "relative" }}>
          <canvas
            id="canvas"
            style={{ border: "1px solid #333", width: "100%", height: "100%" }}
          />

     
          <FloatingLayer />

     
          <MiniMap />
          <MiniMapLive />
          <MiniMapTimeline />

   
          <ZoomControls />


          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              maxWidth: 260,
            }}
          >
            {TOOLS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTool(t);
                  canvas?.setActiveTool?.(t);
                }}
                style={{
                  margin: 2,
                  fontWeight: tool === t ? "bold" : "normal",
                  outline: tool === t ? "2px solid #4A90E2" : "none",
                }}
              >
                {t}
              </button>
            ))}

            <hr style={{ width: "100%", margin: "6px 0" }} />

            <button onClick={() => canvas?.undo?.()}>Undo</button>
            <button onClick={() => canvas?.redo?.()}>Redo</button>
            <button onClick={addConnector}>Add Connector</button>
          </div>

     
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              background: "#fff",
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <button onClick={addTextNode}>Add Text</button>
            <button onClick={addParagraphNode}>Add Paragraph</button>
            <button onClick={addChecklistNode}>Add Checklist</button>
            <button onClick={addImageNode}>Add Image</button>
            <button onClick={addTaskCardNode}>Add Task Card</button>

            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Add note…"
                style={{ width: 130 }}
              />
              <button onClick={addNote}>Add</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
*/


