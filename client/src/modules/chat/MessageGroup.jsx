// modules/chat/MessageGroup.jsx
// modules/chat/MessageGroup.jsx
import { useAuth } from "../../context/AuthContext";
import MessageItem from "./MessageItem";
import Avatar from "../../components/ui/Avatar";
import "./message.css";

export default function MessageGroup({ messages, openThread, unreadIndex, startIndex }) {
  const { user } = useAuth();
  const me = user?._id;
  const first = messages[0];

  if (!first?.sender) return null;

  return (
    <div className="msg-group">
      <Avatar user={first.sender} />

      <div className="msg-group-body">
        <div className="msg-author">
          {first.sender.name}
        </div>

        {messages.map((m, localIdx) => {
          const globalIdx = startIndex + localIdx;
          const mentioned = m.mentions?.includes(me);

          return (
            <div key={m._id} className={`message-row${mentioned ? " mention" : ""}`}>

              {/* Unread divider — shown above the first unread message */}
              {globalIdx === unreadIndex && (
                <div className="unread-divider">
                  <span>New Messages</span>
                </div>
              )}

              {/* Message content + hover actions */}
              <MessageItem
                message={m}
                openThread={openThread}
              />

              {/* Thread reply action & preview */}
              <div className="msg-actions">
                <button
                  className="reply-btn"
                  onClick={() => openThread?.(m)}
                >
                  Reply
                </button>

                {m.threadCount > 0 && (
                  <div
                    className="thread-preview"
                    onClick={() => openThread?.(m)}
                  >
                    {m.threadCount} {m.threadCount === 1 ? "reply" : "replies"}
                  </div>
                )}
              </div>

              {/* Read receipts */}
              {m.readBy?.length > 0 && (
                <div className="read-receipt">
                  Seen by {m.readBy.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


/*
import MessageItem from "./MessageItem";
import Avatar from "../../components/ui/Avatar";
import './message.css';
import { useAuth } from "../../context/AuthContext";

export default function MessageGroup({ messages, openThread }) {
  const first = messages[0];
  const { user } = useAuth();
  const me = user?._id;

  // const mentioned=m.mentions?.includes(me);



  return (
    <div className="msg-group">
      <Avatar user={first.sender} />

      <div className="msg-group-body">
        <div className="msg-author">
          {first.sender.name}
        </div>

        {messages.map(m => {
          const mentioned=m.mentions?.includes(me);

          return(
          <div key={m._id} className="message-row">
            
            <div className="message">
              <b>{m.sender?.name}</b> {m.content}
            </div>
            <div className={mentioned?"msg mention":"msg"}>
              {globalIndex===unreadIndex &&
              <div className="unread">New Messages</div>
              }
              <MessageItem
                key={m._id}
                message={m}
                openThread={openThread}
              />
            </div>

            

            <div className="msg-actions">

              <button
                className="reply-btn"
                onClick={()=>openThread?.(m)}
              >
                Reply
              </button>

              {m.threadCount>0 &&
                <div
                className="thread-preview"
                onClick={()=>openThread(m)}
                >
                {m.threadCount} replies
                </div>
              }

            </div>

            {m.readBy?.length>0 &&
              <div className="read">
              Seen by {m.readBy.length}
              </div>
            }
          </div>
          )
        })}
      </div>
    </div>
  );
}
*/

