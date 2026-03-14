// canvas/LayersPanel.jsx

import {useCanvas} from "../context/CanvasContext";

export default function LayersPanel(){

 const {nodes,setActiveId}=useCanvas();

 const reorder=(from,to)=>{
    setNodes(prev=>{
    const arr=[...prev];
    const item=arr.splice(from,1)[0];
    arr.splice(to,0,item);
    return arr;
    });
 };

 return(
  <div className="layers">
   {nodes.map(n=>(
    <div key={n.id}
      draggable
      onClick={()=>setActiveId(n.id)}>
      {n.type}
    </div>
   ))}
  </div>
 );
}
