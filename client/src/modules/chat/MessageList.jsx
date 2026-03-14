// modules/chat/MessageList.jsx
// modules/chat/MessageList.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useChat } from "./ChatStore";
import MessageGroup from "./MessageGroup";
import { request } from "../../api/client";

const GROUP_GAP = 5 * 60 * 1000;

export default function MessageList({ openThread }) {
  const { channelId } = useParams();
  const socket = useSocket();
  const { state, dispatch } = useChat();

  const [unreadIndex, setUnreadIndex] = useState(-1);
  const [atBottom, setAtBottom] = useState(true);

  const listRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);

  const ids = state.byChannel[channelId] || [];
  const messages = ids.map(id => state.byId[id]).filter(Boolean);

  // ── Load history ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;

    const load = async () => {
      try {
        const data = await request(`/chat/${channelId}`);
        dispatch({ type: "LOAD_HISTORY", channelId, messages: data.messages });

        if (data.lastReadAt) {
          const idx = data.messages.findIndex(
            m => new Date(m.createdAt) > new Date(data.lastReadAt)
          );
          setUnreadIndex(idx);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    load();
  }, [channelId]);

  // ── Join channel ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;
    socket?.emit("join-channel", channelId);
    dispatch({ type: "READ_CHANNEL", channelId });
  }, [channelId, socket]);

  // ── Incoming socket messages ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handler = msg => {
      if (msg.channel !== channelId) return;
      dispatch({ type: "NEW_MESSAGE", message: msg });
    };

    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, channelId]);

  // ── Auto-scroll when at bottom ───────────────────────────────────────────────
  useEffect(() => {
    if (!atBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ids.length, atBottom]);

  // ── Mark as read ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId || !ids.length) return;
    request("/chat/read", {
      method: "POST",
      body: JSON.stringify({ channel: channelId }),
    }).catch(() => {});
  }, [ids.length, channelId]);

  // ── "Load more" sentinel at top ──────────────────────────────────────────────
  useEffect(() => {
    // Must wait until both refs are attached and channelId is known
    const sentinel = topRef.current;
    const root = listRef.current;
    if (!sentinel || !root) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dispatch({ type: "LOAD_MORE", channelId });
        }
      },
      { root, threshold: 0.1 }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [channelId]); // re-create observer when channel changes

  // ── "At bottom" tracking sentinel ────────────────────────────────────────────
  useEffect(() => {
    const sentinel = bottomRef.current;
    const root = listRef.current;
    if (!sentinel || !root) return;

    const obs = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { root, threshold: 0.1 }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, []); // stable — bottomRef is always in the DOM

  const jumpToLatest = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Group consecutive messages from same author ───────────────────────────────
  const groups = messages.reduce((acc, m) => {
    if (!acc.length) return [[m]];

    const last = acc[acc.length - 1];
    const prev = last[last.length - 1];
    const sameAuthor = prev.sender?._id === m.sender?._id;
    const closeInTime = new Date(m.createdAt) - new Date(prev.createdAt) < GROUP_GAP;

    if (sameAuthor && closeInTime) {
      last.push(m);
    } else {
      acc.push([m]);
    }

    return acc;
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────
  if (!messages.length) {
    return <div className="message-list empty">No messages yet</div>;
  }

  // Track each group's starting index in the flat messages array
  let cursor = 0;

  return (
    <div className="message-list" ref={listRef}>

      {/* Top sentinel — "load more" trigger */}
      <div ref={topRef} style={{ height: 1 }} />

      {groups.map((group, i) => {
        const startIndex = cursor;
        cursor += group.length;

        return (
          <MessageGroup
            key={`group-${group[0]._id}`}
            messages={group}
            openThread={openThread}
            unreadIndex={unreadIndex}
            startIndex={startIndex}
          />
        );
      })}

      {/* Bottom sentinel — auto-scroll & atBottom tracking */}
      <div ref={bottomRef} style={{ height: 1 }} />

      {!atBottom && (
        <button className="jump-to-latest" onClick={jumpToLatest}>
          ↓ Jump to latest
        </button>
      )}
    </div>
  );
}









/*
// modules/chat/MessageList.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { useChat } from "./ChatStore";
import MessageGroup from "./MessageGroup";
import { request } from "../../api/client";

const GROUP_GAP = 5 * 60 * 1000; // 5 min grouping threshold

export default function MessageList({ openThread }) {
  const { channelId } = useParams();
  const socket = useSocket();
  const { state, dispatch } = useChat();

  const [unreadIndex, setUnreadIndex] = useState(-1);
  const [atBottom, setAtBottom] = useState(true);

  const bottomRef = useRef(null);
  const topRef = useRef(null);
  const listRef = useRef(null);

  const ids = state.byChannel[channelId] || [];
  const messages = ids.map(id => state.byId[id]).filter(Boolean);

  // ── Load history ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;

    const load = async () => {
      try {
        const data = await request(`/chat/${channelId}`);

        dispatch({
          type: "LOAD_HISTORY",
          channelId,
          messages: data.messages,
        });

        if (data.lastReadAt) {
          const idx = data.messages.findIndex(
            m => new Date(m.createdAt) > new Date(data.lastReadAt)
          );
          setUnreadIndex(idx);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    load();
  }, [channelId]);

  // ── Join channel room ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;
    socket?.emit("join-channel", channelId);
    dispatch({ type: "READ_CHANNEL", channelId });
  }, [channelId, socket]);

  // ── Incoming messages via socket ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handler = msg => {
      if (msg.channel !== channelId) return;
      dispatch({ type: "NEW_MESSAGE", message: msg });
    };

    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, channelId]);

  // ── Auto-scroll to bottom on new messages (only if already at bottom) ───────
  useEffect(() => {
    if (!atBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ids.length, atBottom]);

  // ── Mark channel as read when new messages arrive ───────────────────────────
  useEffect(() => {
    if (!channelId || !ids.length) return;
    request("/chat/read", {
      method: "POST",
      body: JSON.stringify({ channel: channelId }),
    }).catch(() => {});
  }, [ids.length, channelId]);

  // ── "Load more" when user scrolls to top ───────────────────────────────────
  // KEY FIX: check topRef.current is a real Element before observing
  useEffect(() => {
    const sentinel = topRef.current;
    if (!sentinel) return; // guard — ref not yet attached

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dispatch({ type: "LOAD_MORE", channelId });
        }
      },
      {
        root: listRef.current, // scope to the scroll container
        threshold: 0.1,
      }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();

    // Re-run if channelId changes so we get a fresh observer for each channel
  }, [channelId]);

  // ── Track whether user is at the bottom ────────────────────────────────────
  useEffect(() => {
    const bottom = bottomRef.current;
    if (!bottom) return;

    const obs = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { threshold: 0.1 }
    );

    obs.observe(bottom);
    return () => obs.disconnect();
  }, []); // mount/unmount only — bottomRef is always in the DOM

  // ── Jump to latest ──────────────────────────────────────────────────────────
  const jumpToLatest = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Group messages ──────────────────────────────────────────────────────────
  const groups = messages.reduce((acc, m, i) => {
    if (!acc.length) return [[m]];

    const lastGroup = acc[acc.length - 1];
    const prev = lastGroup[lastGroup.length - 1];
    const sameAuthor = prev.sender._id === m.sender._id;
    const closeInTime = new Date(m.createdAt) - new Date(prev.createdAt) < GROUP_GAP;

    if (sameAuthor && closeInTime) {
      lastGroup.push(m);
    } else {
      acc.push([m]);
    }

    return acc;
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!messages.length) {
    return <div className="message-list empty">No messages yet</div>;
  }

  return (
    <div className="message-list" ref={listRef}>


      <div ref={topRef} style={{ height: 1 }} />

      {groups.map((group, i) => {
        // Find the message index of the first message in this group
        const globalIndex = messages.indexOf(group[0]);

        return (
          <div key={`group-${i}`}>
   
            {globalIndex === unreadIndex && (
              <div className="unread-divider">
                <span>New Messages</span>
              </div>
            )}

            <MessageGroup
              messages={group}
              openThread={openThread}
            />
          </div>
        );
      })}


      <div ref={bottomRef} style={{ height: 1 }} />

  
      {!atBottom && (
        <button className="jump-to-latest" onClick={jumpToLatest}>
          ↓ Jump to latest
        </button>
      )}
    </div>
  );
}
*/






/*
// modules/chat/MessageList.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
// import { useChat } from "./ChatStore";
import MessageGroup from "./MessageGroup";
import { request } from "../../api/client";
import { useChat } from "./ChatStore";

const GROUP_MIN = 5 * 60 * 1000;

export default function MessageList({ openThread }) {
  const [unreadIndex,setUnreadIndex]=useState(-1);
  const [atBottom,setAtBottom]=useState(true);
  const { channelId } = useParams();
  const socket = useSocket();
  const { state, dispatch } = useChat();
  const bottomRef = useRef();
  const topRef=useRef();

  const ids = state.byChannel[channelId] || [];
  const messages = ids.map(id => state.byId[id]);

  // =============================
  // LOAD
  // =============================
 useEffect(()=>{

  const load=async()=>{

    const data=await request(`/chat/${channelId}`);

    dispatch({
      type:"LOAD_HISTORY",
      channelId,
      messages:data.messages
    });

    if(data.lastReadAt){

      const idx=data.messages.findIndex(
      m=>new Date(m.createdAt)>new Date(data.lastReadAt)
      );

      setUnreadIndex(idx);
    }
  };

  load();

  },[channelId]);

  // =============================
  // SOCKET
  // =============================
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (msg.channel !== channelId) return;

      dispatch({ type: "NEW_MESSAGE", message: msg });
    };

    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, channelId]);

  // =============================
  // JOIN
  // =============================
  useEffect(() => {
    socket?.emit("join-channel", channelId);
    dispatch({ type: "READ_CHANNEL", channelId });
  }, [channelId]);

  useEffect(()=>{

    bottomRef.current?.scrollIntoView({
      behavior:"smooth"
    });

    request("/chat/read",{
      method:"POST",
      body:JSON.stringify({channel:channelId})
    });

  },[ids.length]);

  

  useEffect(()=>{

    const obs=new IntersectionObserver(async([e])=>{

      if(e.isIntersecting){

        dispatch({
          type:"LOAD_MORE"
        });

      }

    });

    obs.observe(topRef.current);

    return()=>obs.disconnect();

  },[]);

  if (!messages.length)
    return <div className="message-list empty">No messages</div>;

  // =============================
  // GROUPING
  // =============================
  const groups = [];
  let current = [];

  messages.forEach((m, i) => {
    if (!current.length) {
      current.push(m);
      return;
    }

    const prev = current[current.length - 1];

    if (
      prev.sender._id === m.sender._id &&
      new Date(m.createdAt) - new Date(prev.createdAt) < GROUP_MIN
    ) {
      current.push(m);
    } else {
      groups.push(current);
      current = [m];
    }
  });

  

  if (current.length) groups.push(current);

  return (
    
    <div className="message-list" >

      <div ref={topRef}/>

      {groups.map((g, i) => (
        <>
        {/*{i===unreadIndex &&
          <div className="unread">
            New Messages
          </div>
        }
        <MessageGroup
          key={i}
          messages={g}
          openThread={openThread}
        />
        </>
      ))}
      <div ref={bottomRef} />

      {!atBottom &&
        <button
        className="jump"
        onClick={()=>bottomRef.current.scrollIntoView()}
        >
        Jump to latest
        </button>
      }
    </div>
  );
}
*/



/*
import { useEffect, useState, useRef } from "react";
import { request } from "../../services/api";
import { useParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import ReactionBar from "./ReactionBar";

export default function MessageList({ openThread }) {
  const { channelId } = useParams();
  const socket = useSocket();
  const [items, setItems] = useState([]);
  const bottomRef = useRef();

  // =============================
  // LOAD HISTORY
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/chat/${channelId}`);
        setItems(Array.isArray(data) ? data : []);
      } catch {
        setItems([]);
      }
    };

    if (channelId) load();
  }, [channelId]);

  // =============================
  // REALTIME APPEND
  // =============================
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (msg.channel !== channelId) return;
      setItems(prev => [...prev, msg]);
    };

    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [socket, channelId]);

  // =============================
  // JOIN ROOM
  // =============================
  useEffect(() => {
    if (!socket || !channelId) return;
    socket.emit("join-channel", channelId);
  }, [socket, channelId]);

  // =============================
  // AUTO SCROLL
  // =============================
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  // =============================
  if (!items.length) {
    return <div className="message-list empty">No messages</div>;
  }

  return (
    <div className="message-list">
      {items.map((m) => (
        <div key={m._id} className="message-row">
          <div
            className="message"
            onClick={() => openThread?.(m)}
          >
            <b>{m.sender?.name}</b> {m.content}
          </div>

          <ReactionBar message={m} />
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
*/

