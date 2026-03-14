canvas/LayersPanel.jsx

import { useCanvas } from "../context/CanvasContext";

export default function LayersPanel() {
  const { nodes, bringToFront, activeId } = useCanvas();

  return (
    <div className="layers">
      {nodes.map(n=>(
        <div
          key={n.id}
          className={activeId===n.id ? "layer active":"layer"}
          onClick={()=>bringToFront(n.id)}
        >
          {n.type}
        </div>
      ))}
    </div>
  );
}


export default function LayersPanel({ nodes, select }) {
  return (
    <div>
      {nodes.map(n => (
        <div
          key={n.id}
          onClick={() => select(n.id)}
        >
          {n.type} - {n.id}
        </div>
      ))}
    </div>
  );
}

// canvas/LayersPanel.jsx

import {useCanvas} from "../context/CanvasContext";

export default function LayersPanel(){

 const {nodes,setActiveId}=useCanvas();

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
