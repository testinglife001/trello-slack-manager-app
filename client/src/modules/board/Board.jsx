// Board.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Outlet } from "react-router-dom";
import { request } from "../../api/client";
import { useProject } from "../../context/ProjectContext";
import useBoardSocket from "./useBoardSocket";
import List from "./List";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import useDragEngine from "./useDragEngine";
import useUndo from "./useUndo";
import useKeyboard from "./useKeyboard";
import useSelection from "./useSelection";
import "./Board.css";

export default function Board() {
  const { boardId } = useParams();
  const { projectId } = useProject();

  const [lists, setLists] = useState([]);
  const [name, setName] = useState("");
  const containerRef = useRef(null);

  // ======================================================
  // LOAD BOARD
  // ======================================================
  const load = useCallback(async () => {
    if (!boardId) return;

    try {
      const data = await request(`/boards/${boardId}/full`);
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Board load failed", err);
      setLists([]);
    }
  }, [boardId]);

  useEffect(() => {
    load();
  }, [load]);

  // ======================================================
  // SOCKET AUTO RELOAD
  // ======================================================
  useBoardSocket(load);

  // ======================================================
  // ENGINES
  // ======================================================
  const selection = useSelection();
  const undo = useUndo(setLists);
  const drag = useDragEngine({ lists, setLists });

  useKeyboard({ onUndo: undo.undo });

  // ======================================================
  // CREATE LIST
  // ======================================================
  const createList = async () => {
    if (!name.trim()) return;

    await request("/lists", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        board: boardId,
        project: projectId
      })
    });

    setName("");
    load();
  };

  // ======================================================
  // LIST DRAG DETECTION (HORIZONTAL)
  // ======================================================
  const handleListMouseMove = (e) => {
    if (!drag.active) return;

    const elements = [
      ...containerRef.current.querySelectorAll(".list-wrapper")
    ];

    const idx = elements.findIndex(el => {
      const rect = el.getBoundingClientRect();
      return e.clientX < rect.left + rect.width / 2;
    });

    drag.previewList(idx === -1 ? lists.length : idx);
  };

  const handleListMouseUp = () => {
    if (!drag.active) return;
    drag.commitList();
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="board" ref={containerRef}>
      <div
        className="board-scroll"
        onMouseMove={handleListMouseMove}
        onMouseUp={handleListMouseUp}
      >
        {lists.map(list => (
          <div
            key={list._id}
            className="list-wrapper"
            onMouseDown={(e) => {
              // prevent starting list drag if clicking inside card
              if (e.target.closest(".card")) return;
              drag.startList(list._id);
            }}
          >

   
          <List
            key={list._id}
            list={list}
             selection={selection}
            drag={drag}
            undo={undo}
            containerRef={containerRef}
          />
       

        </div>
        ))}

        <div className="add-list">
          <Input
            placeholder="New list"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button type="button" onClick={createList}>
            Add List
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}






/*
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
// import { request } from "../../services/api";
import { request } from "../../api/client";

import { useProject } from "../../context/ProjectContext";
import useBoardSocket from "./useBoardSocket";
import List from "./List";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import useDragEngine from "./useDragEngine";
import useUndo from "./useUndo";
import useKeyboard from "./useKeyboard";
import useSelection from "./useSelection";
import "./Board.css";

export default function Board() {
  const { boardId } = useParams();
  const { projectId } = useProject();

  const [lists, setLists] = useState([]);
  const [name, setName] = useState("");
  const containerRef = useRef();

  
  const load = useCallback(async () => {
    const data = await request(`/boards/${boardId}/full`);
    setLists(data || []);
  }, [boardId]);
  

  useEffect(() => {
    if (!boardId) return;

    const run = async () => {
      try {
        const data = await request(`/boards/${boardId}/full`);
        setLists(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Board load failed", err);
        setLists([]);
      }
    };

    run();
  }, [boardId]);


  // useEffect(load, [load]);
  
  useEffect(() => {
    const run = async () => {
      await load();
    };

    run();
  }, [load]);
  

  // useBoardSocket(load);
  useBoardSocket(setLists);

  const selection = useSelection();
  const undo = useUndo(setLists);
  const drag = useDragEngine({ lists, setLists });

  useKeyboard({ onUndo: undo.undo });

  const createList = async () => {
    if (!name.trim()) return;

    await request("/lists", {
      method: "POST",
      body: JSON.stringify({ name, board: boardId, project: projectId })
    });

    setName("");
    load();
  };

  return (
    <div className="board" ref={containerRef}>
      <div className="board-scroll">
        {lists.map(list => (
          <List
            key={list._id}
            list={list}
            selection={selection}
            drag={drag}
            undo={undo}
            containerRef={containerRef}
          />
        ))}

        <div className="add-list">
          <Input
            placeholder="New list"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button onClick={createList}>Add List</Button>
        </div>
      </div>
    </div>
  );
}
*/

/*
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../services/api";
import { useProject } from "../../context/ProjectContext";
import useBoardSocket from "./useBoardSocket";
import List from "./List";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import useDragEngine from "./useDragEngine";
import useUndo from "./useUndo";
import useKeyboard from "./useKeyboard";
import "./Board.css";
import useSelection from "./useSelection";
import { useRef } from "react";

export default function Board() {
  const { boardId } = useParams();
  const { projectId } = useProject();

  const [lists, setLists] = useState([]);
  const containerRef = useRef();
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    const data = await request(`/boards/${boardId}/full`);
    setLists(data || []);
  }, [boardId]);

  useEffect(load, [load]);
  useBoardSocket(load);

  const drag = useDragEngine({ lists, setLists });
  const undo = useUndo(setLists);
  const selection = useSelection();

  useKeyboard({ onUndo: undo.undo });

  const createList = async () => {
    if (!name.trim()) return;

    await request("/lists", {
      method: "POST",
      body: JSON.stringify({ name, board: boardId, project: projectId })
    });

    setName("");
    load();
  };

  

  return (
    <div className="board">
      <div className="board-scroll">
        {lists.map(list => (
          <List
            key={list._id}
            list={list}
            lists={lists}
            setLists={setLists}
            selection={selection}
            drag={drag}
            undo={undo}
            containerRef={containerRef}
          />
        ))}

        <div className="add-list">
          <Input
            placeholder="New list"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <Button onClick={createList}>Add List</Button>
        </div>
      </div>
    </div>
  );
}
*/
