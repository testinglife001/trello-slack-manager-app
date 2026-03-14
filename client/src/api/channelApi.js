// api/channelApi.js

import api from "./axios";

export const getChannelsByProject = (projectId) =>
  api.get(`/channels/project/${projectId}`);
  