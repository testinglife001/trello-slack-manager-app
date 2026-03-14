// canvas/PortalOverlay.jsx
import React from "react";
import nodeRegistry from "./nodeRegistry";

export default function PortalOverlay({ nodes }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    >
      {nodes.map(node => {
        const Component = nodeRegistry[node.nodeType];
        if (!Component) return null;

        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.left,
              top: node.top,
              width: node.width,
              height: node.height,
              pointerEvents: "auto",
              transformOrigin: "top left",
            }}
          >
            <Component meta={node.meta} />
          </div>
        );
      })}
    </div>
  );
}
