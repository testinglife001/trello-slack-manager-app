// context/CanvasPageContext.jsx
import { createContext, useContext, useState } from "react";

const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [nodes, setNodes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [version, setVersion] = useState(0);

  const addNode = node =>
    setNodes(prev => [...prev, node]);

  const updateNode = (id, data) =>
    setNodes(prev =>
      prev.map(n => n.id === id ? {...n,...data} : n)
    );

  const bringToFront = id => {
    setNodes(prev => {
      const item = prev.find(n => n.id === id);
      return [...prev.filter(n=>n.id!==id), item];
    });
  };

  return (
    <CanvasPageContext.Provider
      value={{
        nodes,
        addNode,
        updateNode,
        activeId,
        setActiveId,
        zoom,
        setZoom,
        version,
        setVersion,
        bringToFront
      }}
    >
      {children}
    </CanvasPageContext.Provider>
  );
};

export const useCanvas = () => useContext(CanvasPageContext);
