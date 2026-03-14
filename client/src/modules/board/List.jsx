// ✅ List.jsx (robust)
// 📁 FIXED List.jsx
// ✅ List.jsx (robust)
// 📁 FIXED List.jsx
// 🧩 List.jsx (DROP + PREVIEW)
import { useState } from "react";
import { useProject } from "../../context/ProjectContext";
import { request } from "../../api/client";
import Card from "./Card";
import "./List.css";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useCallback } from "react";
import { useEffect } from "react";
import useBoardSocket from "./useBoardSocket";
import { useRef } from "react";

export default function List({ list, selection, drag, undo, containerRef }) {

  const { projectId } = useProject();
  const [dropIndex, setDropIndex] = useState(null);
  const [title, setTitle] = useState("");

  const cardsRef = useRef(null);

  // =========================================================
  // CREATE CARD (unchanged logic)
  // =========================================================
  const createCard = async () => {
    if (!title.trim()) return;

    await request("/cards", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        list: list._id,
        board: list.board,
        project: projectId
      })
    });

    setTitle("");
  };

  // =========================================================
  // DETECT DROP INDEX (magnetic)
  // =========================================================
  const detectIndex = (e) => {
    if (!cardsRef.current) return 0;

    const elements = [
      ...cardsRef.current.querySelectorAll(".card:not(.dragging)")
    ];

    const idx = elements.findIndex(el => {
      const rect = el.getBoundingClientRect();
      return e.clientY < rect.top + rect.height / 2;
    });

    return idx === -1 ? list.cards?.length || 0 : idx;
  };

  // =========================================================
  // DRAG MOVE
  // =========================================================
  const onMouseMove = (e) => {
    if (!drag.active) return;

    const idx = detectIndex(e);
    setDropIndex(idx);

    drag.preview(list._id, idx);
  };

  // =========================================================
  // DRAG END
  // =========================================================
  const onMouseUp = async () => {
    if (!drag.active) return;

    await drag.commit();
    setDropIndex(null);
  };

  useEffect(() => {
    setDropIndex(null);
  }, [list.cards]);

  // =============================
  // REALTIME
  // =============================
  useBoardSocket({
    onCardCreated: (card) => {
      if (card.list !== list._id) return;

      setCards(prev => {
        if (prev.some(c => c._id === card._id)) return prev;
        return [...prev, card];
      });
    },

    onCardDeleted: (card) => {
      if (card.list !== list._id) return;
      setCards(prev => prev.filter(c => c._id !== card._id));
    },

    onCardMoved: ({ cardId, fromList, toList, card }) => {
      if (fromList === list._id) {
        setCards(prev => prev.filter(c => c._id !== cardId));
      }

      if (toList === list._id) {
        setCards(prev => [...prev, card]);
      }
    }
  });


  useEffect(() => {
    // setCards(list.cards || []);
  }, [list.cards]);


  return (
    <div 
      className="list" 
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div className="list-title">{list.name}</div>

      <div className="cards"  ref={cardsRef} >
        {list.cards?.map((card, i) => (
         <div key={card._id}>
            {dropIndex === i && <div className="drop-placeholder" />}
            <Card
              // key={card._id}
              card={card}
              index={i}
              listId={list._id}
              selection={selection}
              drag={drag}
              undo={undo}
              containerRef={containerRef}
            />
          </div>
        ))}
        
         {dropIndex === list.cards?.length && (
          <div className="drop-placeholder" />
        )}
        
      </div>
      <div className="add-card">
        <Input
          placeholder="New card"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Button onClick={createCard}>Add</Button>
      </div>
    </div>
  );
}






/*
import { useState } from "react";
import Card from "./Card";
import "./List.css";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function List({
  list,
  lists,
  setLists,
  selection,
  drag,
  undo,
  containerRef
}) {
  const [dropIndex, setDropIndex] = useState(null);

  return (
    <div
      className="list"
      onMouseMove={(e) => {
        if (!drag.active) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;

        const approxIndex = Math.floor(y / 64);
        setDropIndex(Math.max(0, Math.min(list.cards.length, approxIndex)));
      }}
    >
      <div className="list-title">{list.name}</div>

      <div className="cards">
        {list.cards.map((card, i) => (
          <div key={card._id}>
            {dropIndex === i && <DropPlaceholder />}
            <Card
              card={card}
              index={i}
              listId={list._id}
              selection={selection}
              drag={drag}
              containerRef={containerRef}
            />
            
            <Card
              key={card._id}
              card={card}
              index={index}
              listId={list._id}
              lists={lists}
              setLists={setLists}
              selection={selection}
              drag={drag}
              undo={undo}
              containerRef={containerRef}
            />
            
          </div>
        ))}

        {dropIndex === list.cards.length && <DropPlaceholder />}
      </div>

      <div className="add-card">
        <Input
          placeholder="New card"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Button onClick={createCard}>Add</Button>
      </div>
    </div>
  );
}

function DropPlaceholder() {
  return <div className="drop-placeholder" />;
}
*/










/* 
import Card from "./Card";
import "./List.css";

export default function List({
  list,
  lists,
  setLists,
  selection,
  drag,
  undo,
  containerRef
}) {
  return (
    <div className="list">
      <div className="list-title">{list.name}</div>

      <div className="cards">
        {list.cards.map((card, index) => (
          <Card
            key={card._id}
            card={card}
            index={index}
            listId={list._id}
            lists={lists}
            setLists={setLists}
            selection={selection}
            drag={drag}
            undo={undo}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
}

*/



/*
import { useEffect, useState, useCallback } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import Card from "./Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "./List.css";
import useSelection from "./useSelection";

export default function List({
  list,
  lists,
  setLists,
  selection,
  drag,
  undo,
  containerRef
}) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [cards, setCards] = useState([]);
  const [title, setTitle] = useState("");

  const load = useCallback(async () => {
    const data = await request(`/cards/list/${list._id}`);
    setCards(data || []);
  }, [list._id]);

  const selection = useSelection();

  useEffect(load, [load]);

  const createCard = async () => {
    if (!title.trim()) return;

    await request("/cards", {
      method: "POST",
      body: JSON.stringify({
        title,
        list: list._id,
        project: projectId
      })
    });

    setTitle("");
    load();
  };

  const onDrop = async (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;

    await request(`/cards/${cardId}`, {
      method: "PUT",
      body: JSON.stringify({ list: list._id })
    });

    socket.emit("card-move", {
      project: projectId,
      cardId,
      listId: list._id
    });

    load();
  };

  return (
    <>
    
    <div
      className="list"
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <h3>{list.name}</h3>

      <div className="cards">
        {cards.map((card, i) => (
          <Card
            key={card._id}
            card={card}
            index={i}
            listId={list._id}
            moveCard={moveCard}
            startDrag={startDrag}
            toggle={selection.toggle} 
          />
        ))}
      </div>

      <div className="add-card">
        <Input
          placeholder="New card"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Button onClick={createCard}>Add</Button>
      </div>
    </div>
    
    <div className="list">
      <div className="list-title">{list.name}</div>

      <div className="cards">
        {list.cards.map((card, index) => (
          <Card
            key={card._id}
            card={card}
            index={index}
            listId={list._id}
            lists={lists}
            setLists={setLists}
            selection={selection}
            drag={drag}
            undo={undo}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
    </>
  );
}
*/




/*
import { useEffect, useState, useCallback } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import Card from "./Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "./List.css";
import useSelection from "./useSelection";

export default function List({
  list,
  lists,
  setLists,
  selection,
  drag,
  undo,
  containerRef
}) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [cards, setCards] = useState([]);
  const [title, setTitle] = useState("");

  const load = useCallback(async () => {
    const data = await request(`/cards/list/${list._id}`);
    setCards(data || []);
  }, [list._id]);

  const selection = useSelection();

  useEffect(load, [load]);

  const createCard = async () => {
    if (!title.trim()) return;

    await request("/cards", {
      method: "POST",
      body: JSON.stringify({
        title,
        list: list._id,
        project: projectId
      })
    });

    setTitle("");
    load();
  };

  const onDrop = async (e) => {
    const cardId = e.dataTransfer.getData("cardId");
    if (!cardId) return;

    await request(`/cards/${cardId}`, {
      method: "PUT",
      body: JSON.stringify({ list: list._id })
    });

    socket.emit("card-move", {
      project: projectId,
      cardId,
      listId: list._id
    });

    load();
  };

  return (
    <div
      className="list"
      onDragOver={e => e.preventDefault()}
      onDrop={onDrop}
    >
      <h3>{list.name}</h3>

      <div className="cards">
        {cards.map((card, i) => (
          <Card
            key={card._id}
            card={card}
            index={i}
            listId={list._id}
            moveCard={moveCard}
            startDrag={startDrag}
            toggle={selection.toggle} 
          />
        ))}
      </div>

      <div className="add-card">
        <Input
          placeholder="New card"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Button onClick={createCard}>Add</Button>
      </div>
    </div>
  );
}
*/
