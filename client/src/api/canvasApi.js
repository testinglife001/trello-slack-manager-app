// api/canvasApi.js
// frontend/src/api/canvasAPI.js
import axios from "axios";
import api from "./axios";

export const loadCanvas = (channelId) =>
  api.get(`/canvas/${channelId}`);

export const saveCanvas = (channelId, data) =>
  api.put(`/canvas/${channelId}`, data);
  

export const saveCanvasSnapshot = async (channelId, json) => {
  try {
    await axios.put(`/api/canvas/${channelId}`, { content: JSON.stringify(json) });
  } catch (err) {
    console.error("Autosave failed:", err);
  }
};

