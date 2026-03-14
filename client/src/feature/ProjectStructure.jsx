import React from 'react'

const ProjectStructure = () => {
  return (
    <div>ProjectStructure</div>
  )
}

export default ProjectStructure

/*

src/ 
│ ├── app/ 
│   ├── store.js 
│   
└── hooks.js 
│ ├── api/ 
│   ├── axios.js 
│   ├── canvasApi.js 
│   ├── chatApi.js 
│   └── channelApi.js 
│ ├── features/ 
│   ├── canvas/ 
│   │   ├── CanvasPage.jsx 
│   │   ├── FabricCanvas.jsx 
│   │   ├── CanvasTool

*/


/*
src/
│
├── api/
│   ├── axios.js
│   ├── canvasApi.js
│   └── channelApi.js
│
├── context/
│   ├── CanvasContext.jsx
│   └── ChannelContext.jsx
│
├── pages/
│   └── CanvasPage.jsx
│
├── canvas/
│   ├── FabricBoard.jsx
│   └── Toolbar.jsx
│
├── layout/
│   ├── Sidebar.jsx
│   └── ChannelList.jsx
│
├── floating/
│   ├── FloatingLayer.jsx
│   └── NoteNode.jsx
*/


/*
src/
│
├── context/
│   ├── CanvasContext.jsx
│   ├── ChannelContext.jsx
│   └── ChatContext.jsx
│
├── api/
│   ├── axios.js
│   ├── canvasApi.js
│   ├── channelApi.js
│   └── chatApi.js
│
├── canvas/
│   ├── CanvasPage.jsx
│   ├── FabricBoard.jsx
│   ├── Toolbar.jsx
│   ├── LayersPanel.jsx
│   ├── ZoomControls.jsx
│   └── canvasHelpers.js
│
├── floating/
│   ├── NoteNode.jsx
│   ├── ImageNode.jsx
│   ├── VideoNode.jsx
│   ├── FileNode.jsx
│   └── DocumentNode.jsx
│   ├── FloatingLayer.jsx
│
├── chat/
│   ├── ChatPanel.jsx
│   └── MessageItem.jsx
│
├── layout/
│   ├── Sidebar.jsx
│   └── ChannelList.jsx
│
├── styles/
│   ├── app.css
│   ├── canvas.css
│   └── floating.css
│
├── App.jsx
└── main.jsx
*/


