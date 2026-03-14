// 📁 modules/chat/ThreadInput.jsx
import { useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";

export default function ThreadInput({parent}){

 const [text,setText]=useState("");
 const socket=useSocket();
 const {projectId}=useProject();

 const send=()=>{
   if(!text.trim()) return;

    socket.emit("thread:reply",{
    project:projectId,
    channel:parent.channel,
    parentMessage:parent._id,
    content:text
    });

    setText("");
 };

 return(
 <div className="thread-input">
   <input
     value={text}
     onChange={e=>setText(e.target.value)}
     placeholder="Reply…"
   />
   <button onClick={send}>Send</button>
 </div>
 );
}
