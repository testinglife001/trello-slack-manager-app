// floating/NoteNode.jsx
import {useCanvas} from "../context/CanvasContext";

export default function NoteNode({node}){

 const {setNodes}=useCanvas();

 const move=(e)=>{
   setNodes(prev =>
     prev.map(n=>
       n.id===node.id
       ? {...n,x:e.clientX,y:e.clientY}
       : n
     )
   );
 };

 return(
  <div
    draggable
    onDragEnd={move}
    className="note"
    style={{
      left:node.x,
      top:node.y
    }}
  >
    {node.text}
  </div>
 );
}
