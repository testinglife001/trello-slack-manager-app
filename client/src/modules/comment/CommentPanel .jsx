// ✅ Final Clean CommentPanel .jsx (Production Safe)
import {useState} from "react";
import {request} from "../../services/api";
import {useSocket} from "../../context/SocketContext";
import {useProject} from "../../context/ProjectContext";
import dayjs from "dayjs";

export default function CommentPanel({
 nodeId,
 channelId,
 comments,
 close
}){

 const socket=useSocket();
 const {projectId}=useProject();
 const [text,setText]=useState("");

 const roots=comments.filter(c=>!c.parent);

 const send=async()=>{
  if(!text.trim())return;

  await request("/canvas-comments",{
   method:"POST",
   body:JSON.stringify({
    project:projectId,
    channel:channelId,
    nodeId,
    content:text
   })
  });

  socket.emit("canvas:comment:add",{
   channel:channelId,
   nodeId
  });

  setText("");
 };

 const reply=async(rootId,txt)=>{
  await request("/canvas-comments",{
   method:"POST",
   body:JSON.stringify({
    project:projectId,
    channel:channelId,
    nodeId,
    parent:rootId,
    content:txt
   })
  });
 };

 const resolve=async(id)=>{
  await request(`/canvas-comments/${id}/resolve`,{
   method:"PUT"
  });

  socket.emit("canvas:comment:resolve",{
   channel:channelId,
   _id:id
  });
 };

 return(
 <div className="comment-dock">

  <div className="comment-header">
   Discussion
   <button onClick={close}>✕</button>
  </div>

  <div className="comment-list">

  {roots.map(r=>{

   const children=comments.filter(c=>c.parent===r._id);

   return(
   <div key={r._id} className="comment-thread">

    <b>{r.author?.name}</b>
    <span>{dayjs(r.createdAt).format("DD MMM HH:mm")}</span>

    <div>{r.content}</div>

    {!r.resolved&&(
     <button onClick={()=>resolve(r._id)}>Resolve</button>
    )}

    <div className="reply-list">
     {children.map(ch=>(
      <div key={ch._id} className="reply">
       <b>{ch.author?.name}</b>
       <div>{ch.content}</div>
      </div>
     ))}
    </div>

    <input
     placeholder="Reply..."
     onKeyDown={e=>{
      if(e.key==="Enter"){
       reply(r._id,e.target.value);
       e.target.value="";
      }
     }}
    />

   </div>
   );
  })}

  </div>

  <input
   value={text}
   onChange={e=>setText(e.target.value)}
   placeholder="Write comment..."
  />
  <button onClick={send}>Send</button>

 </div>
 );
}







/*
import { useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import dayjs from "dayjs";

export default function CommentPanel({
  nodeId,
  channelId,
  comments,
  close
}) {
  const socket = useSocket();
  const { projectId } = useProject();
  const [text, setText] = useState("");

  const list = comments.filter(
    c => String(c.nodeId) === String(nodeId)
  );

  const send = async () => {
    if (!text.trim()) return;

    const c = await request("/canvas-comments",{
      method:"POST",
      body:JSON.stringify({
        project:projectId,
        channel:channelId,
        nodeId,
        content:text
      })
    });



    socket.emit("canvas:comment:add", c);
    setText("");
  };

  const reply = async () => {
    await request("/canvas-comments",{
      method:"POST",
      body:JSON.stringify({
        project:projectId,
        channel:channelId,
        nodeId,
        parent:rootId,
        content:text
      })
    });
  }

  return (
    <div className="comment-dock">
      <div className="comment-header">
        Comments
        <button onClick={close}>✕</button>
      </div>

      <div className="comment-list">
        {list.map(c => (
          <div key={c._id} className="comment-item">
            <b>{c.author?.name || "User"}</b>
            <span style={{ marginLeft: 6, opacity: .6 }}>
              {dayjs(c.createdAt).format("DD MMM HH:mm")}
            </span>
            <div>{c.content}</div>
          </div>
        ))}
      </div>

      <div className="comment-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write comment..."
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
*/



/*
import { useCallback, useEffect, useState } from "react";
import { useProject } from "../../context/ProjectContext";
import { useSocket } from "../../context/SocketContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import dayjs from "dayjs";


export default function CommentPanel({ cardId }) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await request(`/comments/card/${cardId}`);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  }, [cardId]);

  useEffect(() => {
    load();
  }, [load]);

  // join project room
  useEffect(() => {
    if (!socket || !projectId) return;
    socket.emit("join-project", projectId);
  }, [socket, projectId]);

  // realtime listener
  useEffect(() => {
    if (!socket) return;

    const handler = (d) => {
      if (String(d.card) === String(cardId)) {
        load();
      }
    };

    socket.on("comment-added", handler);

    return () => socket.off("comment-added", handler);
  }, [socket, cardId, load]);

  const send = async () => {
    if (!text.trim()) return;

    const newComment = await request(`/comments`, {
      method: "POST",
      body: JSON.stringify({
        card: cardId,
        content: text
      })
    });

    socket.emit("comment-new", {
      project: projectId,
      card: cardId
    });

    setText("");

    // optimistic
    setItems(prev => [newComment, ...prev]);
  };

  return (
    <div>
      <h3>Comments</h3>

      <div>
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment..."
        />
        <Button onClick={send}>Add</Button>
      </div>

      <div>
        {items.map(c => (
          <div key={c._id}>
            <b>{c.author?.name || "User"}</b>
            <span style={{ marginLeft: 10, opacity: 0.6 }}>
              {dayjs(c.createdAt).format("DD MMM HH:mm")}
            </span>
            <div>{c.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
*/

