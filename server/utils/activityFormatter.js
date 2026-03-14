//  server/utils/activityFormatter.js

exports.format = (activity) => {
  const { entityType, action, diff, meta } = activity;

  if (entityType === "card" && action === "updated" && diff?.list) {
    return `moved card "${meta.title}"`;
  }

  if (entityType === "card" && action === "created") {
    return `created card "${meta.title}"`;
  }

  if (entityType === "note" && action === "created") {
    return `created note "${meta.title}"`;
  }

  return `${action} ${entityType}`;
};
