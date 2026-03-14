// ✅ Card.jsx
// 📁 FIXED Card.jsx
// Now no undefined variables.
// 📁 Card.jsx (BUTTERY PRO DRAG)
// 🧩 Card.jsx (DRAG START + SELECT)
// Clean. Predictable.
// 📁 Card.jsx (FINAL DRAG SAFE)

import { useRef, useState } from "react";
import useAutoScroll from "./useAutoScroll";
import "./Card.css";
import dayjs from "dayjs";
import CardModal from "../card/CardModal";

export default function Card({
  card,
  index,
  listId,
  selection,
  drag,
  undo,
  containerRef
}) {
  const ref = useRef();
  const autoScroll = useAutoScroll();
  const [open, setOpen] = useState(false);

  const THRESHOLD = 6;

  const downRef = useRef({
    x: 0,
    y: 0,
    dragging: false
  });

  const overdue =
    card.dueDate && dayjs().isAfter(dayjs(card.dueDate));

  // =====================================================
  // POINTER DOWN
  // =====================================================
  const onMouseDown = (e) => {
    e.stopPropagation();
    if (e.target.closest(".no-drag")) return;

    downRef.current = {
      x: e.clientX,
      y: e.clientY,
      dragging: false
    };

    const move = (ev) => {
      const dx = Math.abs(ev.clientX - downRef.current.x);
      const dy = Math.abs(ev.clientY - downRef.current.y);

      if (!downRef.current.dragging && dx < THRESHOLD && dy < THRESHOLD) {
        return;
      }

      if (!downRef.current.dragging) {
        downRef.current.dragging = true;

        const ids = selection.selected.includes(card._id)
          ? selection.selected
          : [card._id];

        undo.push?.();
        drag.start(ids, listId);

        ref.current?.classList.add("dragging");
        ref.current?.classList.add("ghost");
      }

      autoScroll(ev, containerRef?.current);
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);

      if (!downRef.current.dragging) {
        setOpen(true);
        return;
      }

      drag.commit();

      ref.current?.classList.remove("dragging");
      ref.current?.classList.remove("ghost");

      ref.current?.classList.add("landing");
      setTimeout(() => {
        ref.current?.classList.remove("landing");
      }, 180);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const onClick = (e) => {
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
      selection.toggle(card._id);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`card priority-${card.priority || "normal"}
          ${selection.selected.includes(card._id) ? "selected" : ""}`}
        onMouseDown={onMouseDown}
        onClick={onClick}
      >
        <div className="card-title">{card.title}</div>

        {card.dueDate && (
          <div className={`due ${overdue ? "overdue" : ""}`}>
            {dayjs(card.dueDate).format("DD MMM")}
          </div>
        )}
      </div>

      {open && (
        <CardModal
          cardId={card._id}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}















/*
import { useRef, useState } from "react";
import useAutoScroll from "./useAutoScroll";
import "./Card.css";
import dayjs from "dayjs";
import CardModal from "../card/CardModal";

export default function Card({
  card,
  index,
  listId,
  selection,
  drag,
  undo,
  containerRef
}) {
  const ref = useRef();
  const autoScroll = useAutoScroll();
  const [open, setOpen] = useState(false);

  const THRESHOLD = 6;

  const downRef = useRef({
    x: 0,
    y: 0,
    dragging: false
  });

  const overdue =
    card.dueDate && dayjs().isAfter(dayjs(card.dueDate));

  // ==========================================
  // POINTER DOWN
  // ==========================================
  const onMouseDown = (e) => {
    e.stopPropagation();

    if (e.target.closest(".no-drag")) return;

    downRef.current = {
      x: e.clientX,
      y: e.clientY,
      dragging: false
    };

    const move = (ev) => {
      const dx = Math.abs(ev.clientX - downRef.current.x);
      const dy = Math.abs(ev.clientY - downRef.current.y);

      if (!downRef.current.dragging && dx < THRESHOLD && dy < THRESHOLD) {
        return;
      }

      // start drag once
      if (!downRef.current.dragging) {
        downRef.current.dragging = true;

        const ids = selection.selected.includes(card._id)
          ? selection.selected
          : [card._id];

        undo.push?.();
        drag.start(ids, listId);
        ref.current?.classList.add("dragging");
      }

      autoScroll(ev, containerRef?.current);
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);

      // =====================================
      // CLICK → OPEN MODAL
      // =====================================
      if (!downRef.current.dragging) {
        setOpen(true);
        return;
      }

      // =====================================
      // DRAG END
      // =====================================
      drag.commit();
      ref.current?.classList.remove("dragging");

      ref.current?.classList.add("landing");
      setTimeout(() => {
        ref.current?.classList.remove("landing");
      }, 180);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  // ==========================================
  // MULTI SELECT
  // ==========================================
  const onClick = (e) => {
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
      selection.toggle(card._id);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`card priority-${card.priority || "normal"} 
        ${selection.selected.includes(card._id) ? "selected" : ""}`}
        onMouseDown={onMouseDown}
        onClick={onClick}
      >
        <div className="card-title">{card.title}</div>

        {card.dueDate && (
          <div className={`due ${overdue ? "overdue" : ""}`}>
            {dayjs(card.dueDate).format("DD MMM")}
          </div>
        )}

        {!!card.subtaskCount && (
          <div className="progress">
            {card.completedSubtaskCount}/{card.subtaskCount}
          </div>
        )}

        {!!card.attachmentsCount && (
          <div className="attach">📎 {card.attachmentsCount}</div>
        )}
      </div>

      {open && (
        <CardModal
          cardId={card._id}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
*/






/*
import { useRef } from "react";
import useAutoScroll from "./useAutoScroll";
import "./Card.css";

export default function Card({
  card,
  index,
  listId,
  lists,
  selection,
  drag,
  undo,
  containerRef
}) {
  const ref = useRef();
  const autoScroll = useAutoScroll();

  const onMouseUp = async () => {
    drag.finish();   // state already updated optimistically

    // give UI one frame to settle
    requestAnimationFrame(() => {
      ref.current?.classList.add("landing");
      setTimeout(() => {
        ref.current?.classList.remove("landing");
      }, 180);
    });

    await request("/cards/reorder", {
      method: "POST",
      body: JSON.stringify(drag.payload)
    });
  };


  const onMouseDown = (e) => {
    e.preventDefault();

    undo.push(lists);
    drag.start();

    const selected = selection.selected.includes(card._id)
      ? selection.selected
      : [card._id];

    const move = (ev) => {
      autoScroll(ev, containerRef.current);
    };

    const up = async (ev) => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);

      // API reorder call
      await fetch(`/api/cards/reorder`, {
        method: "POST",
        body: JSON.stringify({
          cards: selected,
          toList: listId,
          toIndex: index
        })
      });
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  const rects = [...e.currentTarget.querySelectorAll(".card")]
  .map(el => el.getBoundingClientRect());

  const index = rects.findIndex(r => e.clientY < r.top + r.height / 2);


  return (
    <div
      ref={ref}
      className={`card ${selection.selected.includes(card._id) ? "selected" : ""}`}
      onMouseDown={onMouseDown}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) selection.toggle(card._id);
      }}
    >
      {card.title}
    </div>
  );
}
*/






/*
import { useState } from "react";
import dayjs from "dayjs";
import CardModal from "../card/CardModal";
import useSelection from "./useSelection";
import "./Card.css";

export default function Card({
  card,
  listId,
  index,
  moveCard,
  startDrag
}) {
  const [open, setOpen] = useState(false);
  const { toggle } = useSelection(); // local for now

  const dragStart = (e) => {
    startDrag();
    e.dataTransfer.setData("cardId", card._id);
  };

  const overdue =
    card.dueDate && dayjs().isAfter(dayjs(card.dueDate));

  return (
    <>
      <div
        className={`card priority-${card.priority || "normal"}`}
        draggable
        onDragStart={dragStart}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) toggle(card._id);
          else setOpen(true);
        }}
      >
        <div className="card-title">{card.title}</div>

        {card.dueDate && (
          <div className={`due ${overdue ? "overdue" : ""}`}>
            {dayjs(card.dueDate).format("DD MMM")}
          </div>
        )}
      </div>

      {open && (
        <CardModal
          cardId={card._id}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
*/
