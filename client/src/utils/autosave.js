// utils/autosave.js
import debounce from "lodash.debounce";
import { saveCanvas } from "../api/canvasApi";

export const autosave = debounce(
  (channelId, payload) => {
    saveCanvas(channelId, payload);
  },
  1500
);
