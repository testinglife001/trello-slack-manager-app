// server/utils/diffEngine.js

exports.computeDiff = (before, after, fields = []) => {
  const diff = {};

  fields.forEach(field => {
    if (before[field] !== after[field]) {
      diff[field] = {
        from: before[field],
        to: after[field]
      };
    }
  });

  return Object.keys(diff).length ? diff : null;
};
