// modules/card/CardModal.jsx
import { useEffect, useState } from "react";
import { request } from "../../services/api";
import Modal from "../../components/ui/Modal";
import "./CardModal.css";

import DescriptionEditor from "./DescriptionEditor";
import SubtaskTree from "../subtask/SubtaskTree";
import AttachmentPanel from "./AttachmentPanel";
import CommentPanel from "./CommentPanel";
import ActivityPanel from "../activity/ActivityPanel";

import Input from "../../components/ui/Input";
import AssigneePicker from "./AssigneePicker";
import AssigneeAvatarStack from "./AssigneeAvatarStack";

import CollaborativeNote from "../notes/CollaborativeNote";
import CardNotePanel from "../notes/CardNotePanel";

export default function CardModal({ cardId, onClose }) {
  const [card, setCard] = useState(null);
  const [tab, setTab] = useState("details");
  const [assignees, setAssignees] = useState([]);
  const [notes, setNotes] = useState([]);

  

  // =============================
  // LOAD CARD
  // =============================
  const loadCard = async () => {
    const data = await request(`/cards/${cardId}`);
    setCard(data.card);
  };

  useEffect(() => {
    loadCard();
  }, [cardId]);

  useEffect(() => {
    if (card?.assignees) setAssignees(card.assignees);
  }, [card]);

  // =============================
  // LOAD NOTES LINKED TO CARD
  // =============================
  const loadNotes = async () => {
    try {
      const data = await request(`/notes?linkedCard=${cardId}`);
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [cardId]);

  // =============================
  // ASSIGNEE SAVE
  // =============================
  const saveAssignees = async (next) => {
    setAssignees(next);

    await request(`/cards/${card._id}`, {
      method: "PUT",
      body: JSON.stringify({
        assignees: next.map((u) => u._id),
      }),
    });
  };

  if (!card) return <div>Loading...</div>;

  return (
    <Modal onClose={onClose}>
      {/* ================= TABS ================= */}
      <div className="tabs">
        <button
          className={tab === "details" ? "active" : ""}
          onClick={() => setTab("details")}
        >
          Details
        </button>

        <button
          className={tab === "activity" ? "active" : ""}
          onClick={() => setTab("activity")}
        >
          Activity
        </button>

        <button
          className={tab === "notes" ? "active" : ""}
          onClick={() => setTab("notes")}
        >
          Notes
        </button>

      </div>

      {/* ================= DETAILS ================= */}
      {tab === "details" && (
        <div className="card-modal">
          {/* HEADER */}
          <div className="card-header">
            <Input
              value={card.title}
              onChange={async (e) => {
                const title = e.target.value;
                setCard({ ...card, title });

                await request(`/cards/${card._id}`, {
                  method: "PUT",
                  body: JSON.stringify({ title }),
                });
              }}
            />

            <select
              value={card.priority}
              onChange={async (e) => {
                const priority = e.target.value;
                setCard({ ...card, priority });

                await request(`/cards/${card._id}`, {
                  method: "PUT",
                  body: JSON.stringify({ priority }),
                });
              }}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>

            <Input
              type="date"
              value={card.dueDate?.slice(0, 10) || ""}
              onChange={async (e) => {
                const dueDate = e.target.value;
                setCard({ ...card, dueDate });

                await request(`/cards/${card._id}`, {
                  method: "PUT",
                  body: JSON.stringify({ dueDate }),
                });
              }}
            />
          </div>

          <DescriptionEditor card={card} reload={loadCard} />

          {/* ASSIGNEES */}
          <div style={{height:'100%'}} >
          <h5 style={{color:'black'}}>Assignees</h5>
          <AssigneeAvatarStack
            users={assignees}
            remove={(u) =>
              saveAssignees(assignees.filter((a) => a._id !== u._id))
            }
          />
          <AssigneePicker value={assignees} onChange={saveAssignees} />
          </div>  
          

          <SubtaskTree cardId={cardId} />

          {/* ================= NOTES (COLLAB) ================= */}
          <h5>Collaborative Notes</h5>

          {notes.length === 0 && (
            <div style={{ opacity: 0.6 }}>No note yet</div>
          )}

          {notes.map((n) => (
            <CollaborativeNote key={n._id} noteId={n._id} />
          ))}

          
          <AttachmentPanel cardId={cardId} />
          <CommentPanel cardId={cardId} />
        </div>
      )}

      {/* ================= ACTIVITY ================= */}
      {tab === "activity" && <ActivityPanel />}

      {tab === "notes" && (
        <CardNotePanel cardId={cardId} />
      )}


      
    </Modal>
  );
}








/*
import { useEffect, useState } from "react";
import { request } from "../../services/api";
import Modal from "../../components/ui/Modal";
// import Modal from "../../components/Modal";
import './CardModal.css'
import DescriptionEditor from "./DescriptionEditor";
import SubtaskTree from "../subtask/SubtaskTree";
import NotesPanel from "../notes/NotesPanel";
import AttachmentPanel from "./AttachmentPanel";
import CommentPanel from "./CommentPanel";
import ActivityPanel from "../activity/ActivityPanel";
import Input from "../../components/ui/Input";
import AssigneePicker from "./AssigneePicker";
import AssigneeAvatarStack from "./AssigneeAvatarStack";
import CollaborativeNote from "../notes/CollaborativeNote";



export default function CardModal({ cardId, onClose }) {
  const [card, setCard] = useState(null);
  const [tab, setTab] = useState("details");
  const [assignees, setAssignees] = useState([]);



  const load = async () => {
    const data = await request(`/cards/${cardId}`);
    setCard(data.card);
  };

  useEffect(() => {
    load();
  }, [cardId]);

  useEffect(() => {
    if (card?.assignees) setAssignees(card.assignees);
  }, [card]);

  const saveAssignees = async (next) => {
    setAssignees(next);

    await request(`/cards/${card._id}`, {
        method: "PUT",
        body: JSON.stringify({
        assignees: next.map(u => u._id)
        })
    });
  };



  if (!card) return <div>Loading...</div>;


  return (
    <Modal onClose={onClose}>

      <div className="tabs">
        <button
            className={tab === "details" ? "active" : ""}
            onClick={() => setTab("details")}
        >
            Details
        </button>

        <button
            className={tab === "activity" ? "active" : ""}
            onClick={() => setTab("activity")}
        >
            Activity
        </button>
      </div>

      <div className="card-modal">
        <h2>{card.title}</h2>

        <div className="tabs">
        <button
            className={tab === "details" ? "active" : ""}
            onClick={() => setTab("details")}
        >
            Details
        </button>

        <button
            className={tab === "activity" ? "active" : ""}
            onClick={() => setTab("activity")}
        >
            Activity
        </button>
        </div>


        <div className="card-header">
        <Input
            value={card.title}
            onChange={async e => {
            const title = e.target.value;
            setCard({ ...card, title });

            await request(`/cards/${card._id}`, {
                method: "PUT",
                body: JSON.stringify({ title })
            });
            }}
        />

        <select
            value={card.priority}
            onChange={async e => {
            const priority = e.target.value;
            setCard({ ...card, priority });

            await request(`/cards/${card._id}`, {
                method: "PUT",
                body: JSON.stringify({ priority })
            });
            }}
        >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
        </select>

        <input
            type="date"
            value={card.dueDate?.slice(0,10) || ""}
            onChange={async e => {
            const dueDate = e.target.value;
            setCard({ ...card, dueDate });

            await request(`/cards/${card._id}`, {
                method: "PUT",
                body: JSON.stringify({ dueDate })
            });
            }}
        />
        </div>


        <DescriptionEditor card={card} reload={load} />
        <SubtaskTree cardId={cardId} />
        <NotesPanel cardId={cardId} />
        <AttachmentPanel cardId={cardId} />
        <CommentPanel cardId={cardId} />
        <ActivityPanel />
      </div>*

      {tab === "details" && (
        <>
        <div className="card-modal">
        <div className="card-header">
            <Input
                value={card.title}
                onChange={async e => {
                const title = e.target.value;
                setCard({ ...card, title });

                await request(`/cards/${card._id}`, {
                    method: "PUT",
                    body: JSON.stringify({ title })
                });
                }}
            />

            <select
                value={card.priority}
                onChange={async e => {
                const priority = e.target.value;
                setCard({ ...card, priority });

                await request(`/cards/${card._id}`, {
                    method: "PUT",
                    body: JSON.stringify({ priority })
                });
                }}
            >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
            </select>

            <Input
                type="date"
                value={card.dueDate?.slice(0,10) || ""}
                onChange={async e => {
                const dueDate = e.target.value;
                setCard({ ...card, dueDate });

                await request(`/cards/${card._id}`, {
                    method: "PUT",
                    body: JSON.stringify({ dueDate })
                });
                }}
            />

            

        </div>
        <DescriptionEditor card={card} reload={load} />

        <h5>Assignees</h5>

        <AssigneeAvatarStack
        users={assignees}
        remove={(u) =>
            saveAssignees(assignees.filter(a => a._id !== u._id))
        }
        />

        <AssigneePicker
        value={assignees}
        onChange={saveAssignees}
        />

        <SubtaskTree cardId={cardId} />


        
        {<NotesPanel cardId={cardId} />}
        <CollaborativeNote noteId={note._id} />


        <AttachmentPanel cardId={cardId} />
        <CommentPanel cardId={cardId} />
        </div>
        </>
        )}

        {tab === "activity" && <ActivityPanel />}


    </Modal>
  );
}
*/
