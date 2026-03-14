// context/CanvasContext.jsx
// context/CanvasContext.jsx
import { createContext, useContext, useRef, useState } from "react";
import { createHistory } from "../utils/history";

export const CanvasContext = createContext(null);

export function CanvasProvider({ children }) {
  // ── Fabric canvas instance (set by useCanvasEngine) ──────────────────────
  const [canvas, setCanvas] = useState(null);
  const [fabricJSON, setFabricJSON] = useState(null);
  // fabricRef mirrors canvas so snapshot helpers can read it without
  // triggering re-renders on every change
  const fabricRef = useRef(null);

  // Keep fabricRef in sync with canvas state
  const setCanvasAndRef = (c) => {
    fabricRef.current = c;
    setCanvas(c);
  };

  // ── Nodes (mirror of canvas.getObjects(), kept in React state) ────────────
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // ── Tool & viewport ───────────────────────────────────────────────────────
  const [tool, setTool] = useState("select");
  const [zoom, setZoom] = useState(1);
  const [version, setVersion] = useState(0);

  // ── Node helpers ──────────────────────────────────────────────────────────
  const addNode = node => setNodes(prev => [...prev, node]);

  const updateNode = (id, data) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));

  const bringToFront = id =>
    setNodes(prev => {
      const item = prev.find(n => n.id === id);
      if (!item) return prev;
      return [...prev.filter(n => n.id !== id), item];
    });

  // ── History ───────────────────────────────────────────────────────────────
  const historyRef = useRef(createHistory());

  const getSnapshot = () => ({
    // Use fabricRef.current (kept in sync above) — NOT canvas directly,
    // because canvas captured in a closure would be stale after re-renders
    fabric: fabricRef.current?.toJSON(),
    nodes,
  });

  const pushHistory = snapshot => historyRef.current.push(snapshot);

  const restoreSnapshot = ({ fabric, nodes: savedNodes }) => {
    // fabricRef.current is always the live Fabric instance
    if (fabric && fabricRef.current) {
      fabricRef.current.loadFromJSON(fabric, () => fabricRef.current.renderAll());
    }
    if (savedNodes) setNodes(savedNodes);
  };

  const undo = () => {
    const state = historyRef.current.undo(getSnapshot());
    if (state) restoreSnapshot(state);
  };

  const redo = () => {
    const state = historyRef.current.redo(getSnapshot());
    if (state) restoreSnapshot(state);
  };

  return (
    <CanvasContext.Provider
      value={{
        // Fabric
        canvas,
        setCanvas: setCanvasAndRef, // always use this so fabricRef stays in sync
        fabricJSON, setFabricJSON,
        fabricRef,

        // Nodes
        nodes, setNodes,
        selectedNode, setSelectedNode,
        activeId, setActiveId,
        addNode, updateNode, bringToFront,

        // Tool & viewport
        tool, setTool,
        zoom, setZoom,
        version, setVersion,

        // History
        getSnapshot, pushHistory, undo, redo,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used inside <CanvasProvider>");
  return ctx;
};




/*
// context/CanvasContext.jsx
import { createContext, useContext, useRef, useState } from "react";
import { createHistory } from "../utils/history";

export const CanvasContext = createContext();

export function CanvasProvider({ children }) {
  // Canvas / Fabric
  const [canvas, setCanvas] = useState(null);
  const [fabricJSON, setFabricJSON] = useState(null);
  const fabricRef = useRef(null);

  // Nodes
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // Tool & UI
  const [tool, setTool] = useState("select");
  const [zoom, setZoom] = useState(1);
  const [version, setVersion] = useState(0);

  // Node operations
  const addNode = node => setNodes(prev => [...prev, node]);

  const updateNode = (id, data) =>
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));

  const bringToFront = id =>
    setNodes(prev => {
      const item = prev.find(n => n.id === id);
      return [...prev.filter(n => n.id !== id), item];
    });

  // History
  const historyRef = useRef(createHistory());

  const getSnapshot = () => ({
    fabric: fabricRef.current?.toJSON(),
    nodes,
  });

  const pushHistory = snapshot => historyRef.current.push(snapshot);

  const undo = () => {
    const state = historyRef.current.undo(getSnapshot());
    if (state) restoreSnapshot(state);
  };

  const redo = () => {
    const state = historyRef.current.redo(getSnapshot());
    if (state) restoreSnapshot(state);
  };

  const restoreSnapshot = ({ fabric, nodes: savedNodes }) => {
    if (fabric && fabricRef.current) fabricRef.current.loadFromJSON(fabric);
    if (savedNodes) setNodes(savedNodes);
  };

  return (
    <CanvasContext.Provider
      value={{
        // Canvas / Fabric
        canvas, setCanvas,
        fabricJSON, setFabricJSON,
        fabricRef,

        // Nodes
        nodes, setNodes,
        selectedNode, setSelectedNode,
        activeId, setActiveId,
        addNode, updateNode, bringToFront,

        // Tool & UI
        tool, setTool,
        zoom, setZoom,
        version, setVersion,

        // History
        getSnapshot, pushHistory, undo, redo,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export const useCanvas = () => useContext(CanvasContext);
*/





/*
// context/CanvasContext.jsx
import {createContext,useContext,useRef,useState} from "react";
import {createHistory} from "../utils/history";

const CanvasContext=createContext();

export function CanvasProvider({children}){

    const [canvas, setCanvas] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);

    const [fabricJSON,setFabricJSON]=useState(null);
    // const [nodes,setNodes]=useState([]);
    const [version,setVersion]=useState(0);

    const fabricRef = useRef;

    const [tool,setTool]=useState("select");
    const [activeId,setActiveId]=useState(null);
    const [zoom,setZoom]=useState(1);

    const addNode=node=>setNodes(p=>[...p,node]);

    const updateNode=(id,data)=>{
    setNodes(p=>p.map(n=>n.id===id?{...n,...data}:n));
    };

    const historyRef = createHistory();

    const pushHistory = (snapshot)=>{
    historyRef.push(snapshot);
    };

    const undo = ()=>{
    const state = historyRef.undo(getSnapshot());
    if(state) restoreSnapshot(state);
    };

    const redo = ()=>{
    const state = historyRef.redo(getSnapshot());
    if(state) restoreSnapshot(state);
    };

    const getSnapshot = () => ({
        fabric: fabricRef.current?.toJSON(),
        nodes
    });

 return(
  <CanvasContext.Provider value={{
    canvas,
    setCanvas,
    fabricJSON,
    setFabricJSON,
    nodes,
    setNodes,
    selectedNode,
    setSelectedNode,
    version,
    setVersion,
    undo, 
    redo, 
    pushHistory,
    // addNode,updateNode,
    // tool,setTool,
    // activeId,setActiveId,
    // zoom,setZoom
    getSnapshot
  }}>
    {children}
  </CanvasContext.Provider>
 );
}

export const useCanvas=()=>useContext(CanvasContext);
*/



/*
import {createContext,useContext,useState} from "react";

const CanvasContext=createContext();

export function CanvasProvider({children}){

 const [nodes,setNodes]=useState([]);
 const [tool,setTool]=useState("select");
 const [activeId,setActiveId]=useState(null);
 const [zoom,setZoom]=useState(1);

 const addNode=node=>setNodes(p=>[...p,node]);

 const updateNode=(id,data)=>{
   setNodes(p=>p.map(n=>n.id===id?{...n,...data}:n));
 };

 return(
  <CanvasContext.Provider value={{
    nodes,addNode,updateNode,
    tool,setTool,
    activeId,setActiveId,
    zoom,setZoom
  }}>
   {children}
  </CanvasContext.Provider>
 );
}

export const useCanvas=()=>useContext(CanvasContext);
*/
