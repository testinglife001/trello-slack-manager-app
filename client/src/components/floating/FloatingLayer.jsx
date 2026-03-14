// floating/FloatingLayer.jsx

import {useCanvas} from "../context/CanvasContext";
import NoteNode from "./NoteNode";

export default function FloatingLayer(){

 const {nodes}=useCanvas();

 return(
  <div className="floating-layer">
   {nodes.map(n=>{
     if(n.type==="note")
       return <NoteNode key={n.id} node={n}/>;

     return null;
   })}
  </div>
 );
}
