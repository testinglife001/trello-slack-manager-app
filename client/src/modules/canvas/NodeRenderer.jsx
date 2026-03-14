// modules/canvas/NodeRenderer.jsx
// ✅ 2️⃣ NodeRenderer.jsx (MEDIA ENGINE)
import { useState, useRef } from "react";
import { X } from "lucide-react";
import "./node.css";

export default function NodeRenderer({
  node,
  update,
  deleteNode,
  bringFront,
  onSelect,
  isActive,
  zoom = 1,
  commentCount = 0
}) {
  const [editing, setEditing] = useState(false);
  const drag = useRef(null);

  const d = node.data || {};

  // ================= DRAG =================
  const down = (e) => {
    if (editing) return;

    e.stopPropagation();
    onSelect?.(node.id);
    bringFront?.(node.id);

    drag.current = {
      x: e.clientX,
      y: e.clientY,
      nx: node.x,
      ny: node.y
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const move = (e) => {
    if (!drag.current) return;

    const dx = (e.clientX - drag.current.x) / zoom;
    const dy = (e.clientY - drag.current.y) / zoom;

    update(node.id, {
      x: drag.current.nx + dx,
      y: drag.current.ny + dy
    });
  };

  const up = () => {
    drag.current = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };

  const handlePin=async(e)=>{

    const rect=e.currentTarget.getBoundingClientRect();

    await request(`/canvas-comments/${node.threadId}/pin`,{
      method:"PUT",
      body:JSON.stringify({
      x:e.clientX-rect.left,
      y:e.clientY-rect.top
      })
    });

    socket.emit("canvas:comment:pin",{
      channel:channelId,
      id:node.threadId
    });
  };

  // ================= FILE TYPE HELPERS =================
  const isPDF = (url) => url?.toLowerCase().endsWith(".pdf");

  const isWord = (url) =>
    url?.toLowerCase().endsWith(".doc") ||
    url?.toLowerCase().endsWith(".docx");

  const officeViewer = (url) =>
    `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;

  // ================= DOUBLE CLICK =================
  const handleDoubleClick = () => {
    if (node.type === "note" || node.type === "text") {
      setEditing(true);
    }
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNode(node.id);
  }

  // ================= RENDER =================
  return (
    <div
      className={`canvas-node ${node.type} ${isActive ? "active" : ""}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        zIndex: node.order
      }}
      onPointerDown={down}
      onDoubleClick={handleDoubleClick}
    >
      {isActive && (
        <button className="node-delete-btn" onPointerDown={handleDelete}>
          <X size={14} />
        </button>
      )}
      
      <div className="node-label">{node.type}</div>

      {node.pinned&&(
        <div
          className="thread-pin"
          style={{
          position:"absolute",
          left:node.pinned?.x,
          top:node.pinned?.y
          }}
        />
      )}

      {/* ================= NOTE ================= */}
      {node.type === "note" && (
        editing ? (
          <textarea
            autoFocus
            value={d.text || ""}
            placeholder="Write..."
            onBlur={() => setEditing(false)}
            onChange={(e) =>
              update(node.id, { data: { text: e.target.value } })
            }
             style={{ background:'gray',}}
          />
        ) : (
          <div className={`note-preview ${!d.text ? "empty" : ""}`} 
            // style={{width:"100%", height:"100%",padding:'25px'}} 
          >
            {d.text || "Double click to add note"}
          </div>
        )
      )}

      {/* ================= TEXT ================= */}
      {node.type === "text" && (
        editing ? (
          <input
            autoFocus
            defaultValue={d.text}
            placeholder="Type..."
            onBlur={(e) => {
              update(node.id, { data: { text: e.target.value } });
              setEditing(false);
            }}
            // style={{width:"100%", height:"100%",padding:'25px'}}
          />
        ) : (
          <div className={`text-preview ${!d.text ? "empty" : ""}`} 
            style={{width:"100%", height:"100%",padding:'25px'}}
          >
            {d.text || "Double click"}
          </div>
        )
      )}

      {/* ================= IMAGE ================= */}
      {node.type === "image" && (
        d.url
          ? <img src={d.url} alt="" className="media-preview" draggable={false}/>
          : <div className="empty-node">No image</div>
      )}

      {/* ================= VIDEO ================= */}
      {node.type === "video" && (
        d.url
          ? <video src={d.url} controls className="media-preview"/>
          : <div className="empty-node">No video</div>
      )}

      {/* ================= PDF ================= */}
      {node.type === "pdf" && (
        d.url
          ? <iframe src={d.url} title="pdf" className="media-preview"/>
          : <div className="empty-node">No pdf</div>
      )}

      {/* ================= WORD ================= */}
      {node.type === "document" && (
        d.url ? (
          isPDF(d.url) ? (
            <iframe src={d.url} className="media-preview" />
          ) : isWord(d.url) ? (
            <iframe src={officeViewer(d.url)} className="media-preview" />
          ) : (
            <div className="doc-preview">📄 {d.name}</div>
          )
        ) : (
          <div className="doc-preview">📄 {d.name}</div>
        )
      )}

      {!!commentCount && <div className="comment-dot">{commentCount}</div>}
    </div>
  );
}





/*
import { useState, useRef } from "react";
import './node.css'

export default function NodeRenderer({
  node,
  update,
  bringFront,
  onSelect,
  zoom = 1,
  commentCount = 0
}) {
  const [editing, setEditing] = useState(false);
  const drag = useRef(null);

  const d = node.data || {};

  // ================= DRAG
  const down = (e) => {
    if (editing) return;   // 🚫 do not drag while editing

    e.stopPropagation();
    onSelect?.(node.id);
    bringFront?.(node.id);

    drag.current = {
      x: e.clientX,
      y: e.clientY,
      nx: node.x,
      ny: node.y
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const move = (e) => {
    if (!drag.current) return;

    const dx = (e.clientX - drag.current.x) / zoom;
    const dy = (e.clientY - drag.current.y) / zoom;

    update(node.id, {
      x: drag.current.nx + dx,
      y: drag.current.ny + dy
    });
  };

  const up = () => {
    drag.current = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };

  // ================= HELPERS
  const isPDF = (url) => url?.toLowerCase().includes(".pdf");

  // ================= RENDER
  return (
    <div
      className={`canvas-node ${node.type}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        zIndex: node.order
      }}
      onPointerDown={down}
      onDoubleClick={() => {
        if (node.type === "note" || node.type === "text") {
          setEditing(true);
        }
      }}
    >
     
      <div className="node-label">{node.type}</div>

   
      {node.type === "note" && (
        editing ? (
          <textarea
            autoFocus
            value={d.text || ""}
            onBlur={() => setEditing(false)}
            onChange={(e) =>
              update(node.id, { data: { text: e.target.value } })
            }
          />
        ) : (
          <div className="note-preview" >
            {d.text || "Double click to write"}
          </div>
        )
      )}

    
      {node.type === "text" && (
        editing ? (
          <input
            autoFocus
            defaultValue={d.text}
            onBlur={(e) => {
              update(node.id, { data: { text: e.target.value } });
              setEditing(false);
            }}
          />
        ) : (
          <div className="text-preview">
            {d.text || "Double click"}
          </div>
        )
      )}

     
      {node.type === "image" && (
        d.url ? (
          <img
            src={d.url}
            alt=""
            draggable={false}
            className="media-preview"
          />
        ) : (
          <div className="empty-node">No image</div>
        )
      )}


      {node.type === "video" && (
        d.url ? (
          <video
            src={d.url}
            controls
            className="media-preview"
          />
        ) : (
          <div className="empty-node">No video</div>
        )
      )}

      {node.type === "pdf" && (
        d.url ? (
          <iframe
            src={d.url}
            title="pdf"
            className="media-preview"
          />
        ) : (
          <div className="empty-node">No pdf</div>
        )
      )}

 
      {node.type === "document" && (
        d.url ? (
          isPDF(d.url) ? (
            <iframe src={d.url} title="doc" className="media-preview" />
          ) : (
            <div className="doc-preview">📄 {d.name}</div>
          )
        ) : (
          <div className="doc-preview">📄 {d.name}</div>
        )
      )}

      {!!commentCount && (
        <div className="comment-dot">{commentCount}</div>
      )}
    </div>
  );
}
*/








/*
import { useState } from "react";
import { useRef } from "react";
// import './NodeRenderer.css'

export default function NodeRenderer({
  node,
  update,
  bringFront,
  onSelect,
  zoom = 1,
  commentCount = 0
}) {
  const [editing, setEditing] = useState(false);

  const drag = useRef(null);

  const down = e => {
    e.stopPropagation();
    onSelect?.(node.id);
    bringFront?.(node.id);

    drag.current = {
      x: e.clientX,
      y: e.clientY,
      nx: node.x,
      ny: node.y
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const move = e => {
    if (!drag.current) return;

    const dx = (e.clientX - drag.current.x) / zoom;
    const dy = (e.clientY - drag.current.y) / zoom;

    update(node.id, {
      x: drag.current.nx + dx,
      y: drag.current.ny + dy
    });
  };

  const up = () => {
    drag.current = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };

  const d = node.data || {};
  

  return (
    <div
      className={`canvas-node ${node.type}`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        zIndex: node.order
      }}
      onPointerDown={down}
    >

      
      <div style={{position:"absolute", top:-18, fontSize:10, color:'black'}}>
        {node.type}
      </div>



      {node.type === "note" && (
        <textarea
          value={d.text || ""}
          placeholder="Write..."
          onChange={e =>
            update(node.id, { data: { text: e.target.value } })
          }
        />
      )}

     

      {node.type === "text" && (
          editing ? (
          
            <input
              autoFocus
              defaultValue={d.text}
              onBlur={(e)=>{
                update(node.id, { data:{ text:e.target.value }});
                setEditing(false);
              }}
              // style={{width:"100%", height:"100%",padding:'25px'}}
            />
       
          ) : (
            <div onDoubleClick={()=>setEditing(true)} style={{width:"100%", height:"100%",padding:'25px'}}>
              {d.text || "Double click"}
            </div>
          )
        )}


      
      {node.type === "image" && (
        d.url
          ? <img src={d.url} alt="" draggable={false} style={{width:"100%", height:"100%", objectFit:"contain"}}/>
          : <div>image missing</div>
      )}


      {node.type === "video" && (
        d.url
          ? <video src={d.url} controls style={{width:"100%", height:"100%"}}/>
          : <div>video missing</div>
      )}


      {node.type === "video" && (
        d.url
          ? <video src={d.url} controls style={{width:"100%", height:"100%"}}/>
          : <div>video missing</div>
      )}


      {node.type === "document" && <div>📄 {d.name}</div>}

      {!!commentCount && <div className="comment-dot">{commentCount}</div>}
    </div>
  );
}
*/


/*
import { useRef } from "react";

export default function NodeRenderer({
  node,
  update,
  onSelect,
  commentCount = 0
}) {
  const drag = useRef(null);

  // ================= DRAG
  const down = e => {
    e.stopPropagation();
    onSelect?.(node.id);

    drag.current = {
      x: e.clientX,
      y: e.clientY,
      nx: node.x,
      ny: node.y
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const move = e => {
    if (!drag.current) return;

    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;

    update(node.id, {
      x: drag.current.nx + dx,
      y: drag.current.ny + dy
    });
  };

  const up = () => {
    drag.current = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };

  // ================= HELPERS
  const yt = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be")) {
      const id = url.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const data = node.data || {};

  // ================= RENDER
  return (
    <div
      className={`canvas-node ${node.type}`}
      style={{ left: node.x, top: node.y, zIndex: node.order || 1 }}
      onPointerDown={down}
    >
  
      {node.type === "note" && (
        <textarea
          value={data.text || ""}
          placeholder="Write..."
          onChange={e =>
            update(node.id, { data: { text: e.target.value } })
          }
        />
      )}


      {node.type === "text" && (
        <div className="text-node">
          {data.text || "Text"}
        </div>
      )}


      {node.type === "image" && (
        data.url ? (
          <img
            src={data.url}
            alt=""
            draggable={false}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="empty-node">No image</div>
        )
      )}

 
      {node.type === "video" && (
        data.url ? (
          <iframe
            src={yt(data.url)}
            title="video"
            frameBorder="0"
            allowFullScreen
          />
        ) : (
          <div className="empty-node">No video</div>
        )
      )}

      
      {node.type === "document" && (
        <div className="doc-node">
          📄 {data.name || "Document"}
        </div>
      )}

      {!!commentCount && (
        <div className="comment-dot">{commentCount}</div>
      )}
    </div>
  );
}
*/











/*
import { useRef, useState } from "react";

export default function NodeRenderer({
  node,
  update,
  onSelect,
  selectedBy = [],
  commentCount = 0
}) {
  const drag = useRef(null);

  const down = (e) => {
    e.stopPropagation();
    e.preventDefault();

    onSelect?.(node.id);

    drag.current = {
      x: e.clientX,
      y: e.clientY,
      nx: node.x,
      ny: node.y
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const move = (e) => {
    if (!drag.current) return;

    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;

    update(node.id, {
      x: Math.round(drag.current.nx + dx),
      y: Math.round(drag.current.ny + dy)
    });
  };

  const up = () => {
    drag.current = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };

  

  return (
    <div
      className={`canvas-node ${node.type}`}
      style={{
        left: node.x || 0,
        top: node.y || 0,
        zIndex: node.order || 1
      }}
      onPointerDown={down}
    >
      {node.type === "note" && (
        <textarea
          value={node.data?.text || ""}
          onChange={(e) =>
            update(node.id, { data: { text: e.target.value } })
          }
        />
      )}

      {node.type === "text" && (
        <div>{node.data?.text}</div>
      )}

      {node.type === "image" && (
        <img src={node.data?.url} draggable={false} />
      )}

      {node.type === "video" && (
        <iframe src={node.data?.url} title="" />
      )}

      {node.type === "document" && (
        <div>📄 {node.data?.name}</div>
      )}

      {!!commentCount && (
        <div className="comment-dot">{commentCount}</div>
      )}
    </div>
  );
}
*/
