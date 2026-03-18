import { request } from "./client";

export const socialMediaApi = {
  overview: (projectId, channelId) =>
    request(`/social-media/project/${projectId}${channelId ? `?channelId=${channelId}` : ""}`),

  createPost: (projectId, payload) =>
    request(`/social-media/project/${projectId}/posts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updatePost: (postId, payload) =>
    request(`/social-media/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  schedulePost: (postId, scheduledAt) =>
    request(`/social-media/posts/${postId}/schedule`, {
      method: "PUT",
      body: JSON.stringify({ scheduledAt }),
    }),

  publishPost: (postId) =>
    request(`/social-media/posts/${postId}/publish`, {
      method: "PUT",
    }),

  addPostNote: (postId, payload) =>
    request(`/social-media/posts/${postId}/notes`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createTask: (projectId, payload) =>
    request(`/social-media/project/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (taskId, payload) =>
    request(`/social-media/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  createDiscussion: (projectId, payload) =>
    request(`/social-media/project/${projectId}/discussions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
