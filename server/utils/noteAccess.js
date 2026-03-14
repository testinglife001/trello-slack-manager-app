// server/utils/noteAccess.js

exports.canRead = (note, userId, isProjectMember = false) => {
  if (!note) return false;

  if (note.author.equals(userId)) return true;
  if (note.visibility === "public") return true;
  if (note.visibility === "project" && isProjectMember) return true;

  if (note.visibility === "shared") {
    return note.sharedWith.some(u => u.equals(userId));
  }

  return false;
};

exports.canEdit = (note, userId) => {
  return note.author.equals(userId);
};


