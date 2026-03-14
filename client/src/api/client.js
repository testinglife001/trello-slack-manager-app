// src/api/client.js
const API = import.meta.env.VITE_API || "http://localhost:5000/api";

export const request = async (url, options = {}) => {
  const token = localStorage.getItem("accessToken");

  const res = await fetch(API + url, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      // Optional: global logout or redirect
      // localStorage.removeItem("accessToken");
      // window.location.href = "/login";
      return Promise.reject("Unauthorized");
    }
    return Promise.reject(errorData.message || `Request failed with status ${res.status}`);
  }

  return res.json().catch(() => null);
};

export default request;
