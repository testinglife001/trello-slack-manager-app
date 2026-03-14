// canvas/Toolsbar.jsx

import {useCanvas} from "../context/CanvasContext";

export default function Toolsbar(){
 const {tool,setTool}=useCanvas();

 const tools=["select","rect","circle","diamond","line","arrow","pen","text"];

 return(
  <div className="toolbar">
   {tools.map(t=>(
     <button key={t}
       className={tool===t?"active":""}
       onClick={()=>setTool(t)}>
       {t}
     </button>
   ))}
  </div>
 );
}
