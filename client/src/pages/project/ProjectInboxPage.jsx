import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../api/client";
import { 
  Inbox, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Star,
  MoreVertical,
  Reply,
  Trash2,
  Archive
} from "lucide-react";
import "./ProjectInboxPage.css";

const ProjectInboxPage = () => {
  const { projectId } = useParams();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const data = await request(`/projects/${projectId}/inbox`);
        setMessages(data || []);
      } catch (err) {
        console.error("Inbox load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [projectId]);

  return (
    <div className="inbox-container">
      {/* Sidebar - Folders */}
      <div className="inbox-sidebar">
        <div className="sidebar-section">
          <button className="inbox-nav-item active">
            <Inbox size={18} />
            <span>All Messages</span>
            <span className="badge">12</span>
          </button>
          <button className="inbox-nav-item">
            <Star size={18} />
            <span>Starred</span>
          </button>
          <button className="inbox-nav-item">
            <CheckCircle2 size={18} />
            <span>Resolved</span>
          </button>
        </div>

        <div className="sidebar-section">
          <p className="section-title">Labels</p>
          <div className="label-item">
            <div className="label-dot bg-red-500"></div>
            <span>Urgent</span>
          </div>
          <div className="label-item">
            <div className="label-dot bg-blue-500"></div>
            <span>Feedback</span>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="message-list-section">
        <div className="list-header">
          <div className="search-bar">
            <Search size={16} />
            <input type="text" placeholder="Search inbox..." />
          </div>
          <button className="filter-btn"><Filter size={16} /></button>
        </div>

        <div className="messages-scroll">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="empty-inbox">No messages found</div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg._id} 
                className={`message-item ${selectedMsg?._id === msg._id ? 'selected' : ''} ${!msg.read ? 'unread' : ''}`}
                onClick={() => setSelectedMsg(msg)}
              >
                <div className="msg-avatar">
                   <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.name}`} alt="" />
                </div>
                <div className="msg-content">
                  <div className="msg-header">
                    <span className="sender-name">{msg.sender?.name}</span>
                    <span className="msg-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="msg-subject">{msg.subject || "No Subject"}</p>
                  <p className="msg-preview">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="message-detail-section">
        {selectedMsg ? (
          <>
            <div className="detail-header">
              <div className="header-actions">
                <button className="action-btn"><Archive size={18} /></button>
                <button className="action-btn"><Trash2 size={18} /></button>
                <button className="action-btn"><Star size={18} /></button>
              </div>
              <button className="action-btn"><MoreVertical size={18} /></button>
            </div>
            
            <div className="detail-body">
              <h1 className="detail-subject">{selectedMsg.subject || "Message from " + selectedMsg.sender?.name}</h1>
              <div className="sender-info">
                 <img className="info-avatar" src={selectedMsg.sender?.avatar || `https://ui-avatars.com/api/?name=${selectedMsg.sender?.name}`} alt="" />
                 <div>
                   <p className="info-name">{selectedMsg.sender?.name}</p>
                   <p className="info-meta">to project-team@workspace.com</p>
                 </div>
                 <span className="info-time">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-text">
                {selectedMsg.content}
              </div>
            </div>

            <div className="detail-footer">
               <button className="reply-btn"><Reply size={16} /> Reply to {selectedMsg.sender?.name}</button>
            </div>
          </>
        ) : (
          <div className="no-selection">
             <Inbox size={48} />
             <p>Select a message to read</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInboxPage;
