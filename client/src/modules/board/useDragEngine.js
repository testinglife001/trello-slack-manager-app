// 📁 useDragEngine.js
// 📁 useDragEngine.js (UPGRADED)
// useDragEngine.js ✅
// 📁 useDragEngine.js
import { useRef, useState } from "react";
import { request } from "../../api/client";

export default function useDragEngine({ lists, setLists }) {
  const snapshot = useRef(null);
  const dragState = useRef(null);
  const [active, setActive] = useState(false);

  // =========================================================
  // START CARD DRAG
  // =========================================================
  const start = (cardIds, fromListId) => {
    snapshot.current = JSON.parse(JSON.stringify(lists));

    dragState.current = {
      type: "card",
      cardIds,
      fromListId,
      toListId: null,
      toIndex: null
    };

    setActive(true);
  };

  // =========================================================
  // START LIST DRAG
  // =========================================================
  const startList = (listId) => {
    snapshot.current = JSON.parse(JSON.stringify(lists));

    dragState.current = {
      type: "list",
      listId,
      toIndex: null
    };

    setActive(true);
  };

  // =========================================================
  // CARD PREVIEW MOVE
  // =========================================================
  const previewCard = (toListId, toIndex) => {
    if (!dragState.current || dragState.current.type !== "card") return;

    const { cardIds, fromListId } = dragState.current;

    setLists(prev => {
      const copy = JSON.parse(JSON.stringify(prev));

      const from = copy.find(l => l._id === fromListId);
      const to = copy.find(l => l._id === toListId);
      if (!from || !to) return prev;

      const moving = from.cards.filter(c =>
        cardIds.includes(c._id)
      );

      from.cards = from.cards.filter(
        c => !cardIds.includes(c._id)
      );

      to.cards.splice(toIndex, 0, ...moving);

      dragState.current.toListId = toListId;
      dragState.current.toIndex = toIndex;

      return copy;
    });
  };

  // =========================================================
  // LIST PREVIEW MOVE (horizontal)
  // =========================================================
  const previewList = (toIndex) => {
    if (!dragState.current || dragState.current.type !== "list") return;

    const { listId } = dragState.current;

    setLists(prev => {
      const copy = JSON.parse(JSON.stringify(prev));

      const fromIndex = copy.findIndex(l => l._id === listId);
      if (fromIndex === -1) return prev;

      const [moving] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moving);

      dragState.current.toIndex = toIndex;

      return copy;
    });
  };

  // =========================================================
  // GENERIC PREVIEW (called from List component)
  // =========================================================
  const preview = (listId, index) => {
    if (!active) return;
    previewCard(listId, index);
  };

  // =========================================================
  // COMMIT
  // =========================================================
  const commit = async () => {
    if (!dragState.current) return;

    const current = dragState.current;
    setActive(false);

    try {
      // -----------------------------------------
      // CARD REORDER SAVE
      // -----------------------------------------
      if (current.type === "card") {
        const payload = [];

        lists.forEach(list => {
          list.cards.forEach((card, index) => {
            payload.push({
              _id: card._id,
              order: index,
              list: list._id
            });
          });
        });

        await request("/cards/reorder", {
          method: "PUT",
          body: JSON.stringify({ cards: payload })
        });
      }

      // -----------------------------------------
      // LIST REORDER SAVE
      // -----------------------------------------
      if (current.type === "list") {
        const payload = lists.map((list, index) => ({
          _id: list._id,
          order: index
        }));

        await request("/lists/reorder", {
          method: "PUT",
          body: JSON.stringify({ lists: payload })
        });
      }

    } catch (err) {
      rollback();
    }

    dragState.current = null;
  };

  const commitList = () => {
    if (!active) return;
    commit();
  };

  // =========================================================
  // ROLLBACK
  // =========================================================
  const rollback = () => {
    if (snapshot.current) {
      setLists(snapshot.current);
    }
    setActive(false);
    dragState.current = null;
  };

  return {
    // card
    start,
    preview,

    // list
    startList,
    previewList,

    // commit
    commit,
    commitList,

    rollback,
    active
  };
}








/*
import { useRef, useState } from "react";

export default function useDragEngine({ lists, setLists }) {
  const snapshot = useRef(null);
  const dragState = useRef(null);
  const [active, setActive] = useState(false);

  const start = (cardIds, fromListId) => {
    snapshot.current = JSON.parse(JSON.stringify(lists));
    dragState.current = { cardIds, fromListId };
    setActive(true);
  };

  const preview = (toListId, toIndex) => {
    if (!dragState.current) return;

    const { cardIds, fromListId } = dragState.current;

    setLists(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const from = copy.find(l => l._id === fromListId);
      const to = copy.find(l => l._id === toListId);

      const moving = from.cards.filter(c => cardIds.includes(c._id));
      from.cards = from.cards.filter(c => !cardIds.includes(c._id));
      to.cards.splice(toIndex, 0, ...moving);

      return copy;
    });
  };

  const commit = () => {
    dragState.current = null;
    setActive(false);
  };

  const rollback = () => {
    if (snapshot.current) setLists(snapshot.current);
    setActive(false);
  };

  return { start, preview, commit, rollback, active };
}
*/







/*
import { useRef } from "react";

export default function useDragEngine({ lists, setLists }) {
  const snapshot = useRef(null);

  const start = () => {
    snapshot.current = JSON.parse(JSON.stringify(lists));
  };

  const rollback = () => {
    if (snapshot.current) setLists(snapshot.current);
  };

  const moveCards = (cardIds, fromListId, toListId, toIndex) => {
    setLists(prev => {
      const copy = JSON.parse(JSON.stringify(prev));

      const from = copy.find(l => l._id === fromListId);
      const to = copy.find(l => l._id === toListId);

      const moving = from.cards.filter(c => cardIds.includes(c._id));
      from.cards = from.cards.filter(c => !cardIds.includes(c._id));

      to.cards.splice(toIndex, 0, ...moving);

      return copy;
    });
  };

  return { start, rollback, moveCards };
}
*/


/*
import { useRef } from "react";

export default function useDragEngine({ lists, setLists }) {
  const snapshot = useRef(null);

  const start = () => {
    // keep previous state for undo / rollback
    snapshot.current = JSON.parse(JSON.stringify(lists));
  };

  const moveCard = (cardId, fromList, toList, toIndex) => {
    setLists(prev => {
      const copy = JSON.parse(JSON.stringify(prev));

      const source = copy.find(l => l._id === fromList);
      const target = copy.find(l => l._id === toList);

      const idx = source.cards.findIndex(c => c._id === cardId);
      const [card] = source.cards.splice(idx, 1);

      target.cards.splice(toIndex, 0, card);

      return copy;
    });
  };

  const rollback = () => {
    if (snapshot.current) setLists(snapshot.current);
  };

  return { start, moveCard, rollback };
}
*/
