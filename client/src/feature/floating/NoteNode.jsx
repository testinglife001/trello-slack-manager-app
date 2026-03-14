// floating/NoteNode.jsx

import { useCanvas } from "../context/CanvasContext";

export default function NoteNode({ node }) {
  const { updateNode, setActiveId } = useCanvas();

  const dragStart = e => {
    e.dataTransfer.setData("id", node.id);
  };

  const drop = e => {
    const x = e.clientX;
    const y = e.clientY;
    updateNode(node.id,{x,y});
  };

  return (
    <div
      className="note-node"
      draggable
      onDragStart={dragStart}
      onClick={()=>setActiveId(node.id)}
      style={{ left:node.x, top:node.y }}
    >
      <textarea defaultValue={node.text}/>
    </div>
  );
}


/**
floating/NoteNode.jsx

export default function NoteNode({node,onMove}){

 return(
  <div
   draggable
   className="note"
   style={{left:node.x,top:node.y}}
   onDragEnd={e=>onMove(node.id,e.clientX,e.clientY)}
  >
    <textarea defaultValue={node.text}/>
  </div>
 );
}
 */