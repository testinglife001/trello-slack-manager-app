// services/permissions.js
export const can = (role, permissions, need) => {
  if (role === "admin") return true;
  return permissions?.includes(need);
};
