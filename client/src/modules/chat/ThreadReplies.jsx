// 📁 modules/chat/ThreadReplies.jsx
import { useEffect,useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";

export default function ThreadReplies({messageId}){

 const socket=useSocket();
 const [items,setItems]=useState([]);

 const load=async()=>{
   const data=await request(`/threads/${messageId}`);
   setItems(data);
 };

 useEffect(()=>{ load(); },[messageId]);

 useEffect(()=>{

    if(!socket) return;

    const handler=()=>load();

    socket.on("thread:new",handler);

    return()=>socket.off("thread:new",handler);

 },[socket]);

 return(
 <div className="thread-replies">
  {items.map(r=>(
    <div key={r._id}>
     <b>{r.sender?.name}</b>
     {r.content}
    </div>
  ))}
 </div>
 );
}
