import {createContext,useContext,useState} from "react";

const CanvasRouteContext=createContext();

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
  <CanvasRouteContext.Provider value={{
    nodes,addNode,updateNode,
    tool,setTool,
    activeId,setActiveId,
    zoom,setZoom
  }}>
   {children}
  </CanvasRouteContext.Provider>
 );
}

export const useCanvas=()=>useContext(CanvasRouteContext);