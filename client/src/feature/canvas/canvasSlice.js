// features/canvas/canvasSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  nodes: [],
  activeId: null,
  zoom: 1,
  version: 0
};

const slice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    setCanvas(state, action) {
      return action.payload;
    },
    addNode(state, action) {
      state.nodes.push(action.payload);
    },
    selectNode(state, action) {
      state.activeId = action.payload;
    },
    updateZoom(state, action) {
      state.zoom = action.payload;
    }
  }
});

export const actions = slice.actions;
export default slice.reducer;
