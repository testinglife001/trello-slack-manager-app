// sockets/index.js
// sockets/index.js
const { Server } = require("socket.io");
const { setIO } = require("./io");
const authSocket = require("./authSocket");

const User = require("../models/User");
const Message = require("../models/Message");
const Thread = require("../models/Thread");
const Reaction = require("../models/Reaction");

const registerCanvas = require("./canvasRealtime");

const { extractMentions } = require("../utils/mentionParser");
const { notifyMention, notifyUsers } = require("../services/notificationService");
const { log } = require("../services/activityService");

const Y = require("yjs");
const { getYDoc } = require("../services/crdtService");

// registerCanvas(io, socket);

// require("./canvas")(io, socket, canvasRooms);

// require("./canvas")(io, socket, canvasRooms);

// const { recordActivity } = require("../services/canvasActivityService");

// ─────────────────────────────────────────────────────────────
// Presence Rooms (module scoped)
// ─────────────────────────────────────────────────────────────
const noteRooms = {};
const canvasRooms = {};

module.exports = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  setIO(io);
  global.io = io;

  io.use(authSocket);

  // ─────────────────────────────────────────────────────────────
  // SINGLE CONNECTION HANDLER
  // ─────────────────────────────────────────────────────────────
  io.on("connection", async (socket) => {
    console.log("Socket connected:", socket.id);

    const userId = socket.user?._id?.toString();

    // ───────────────────────── USER ROOM ─────────────────────────
    if (userId) {
      socket.join(`user:${userId}`);
      socket.join(userId);
    }

    socket.on("join-user", (uid) => {
      if (uid) socket.join(`user:${uid}`);
    });

    // ───────────────────────── PRESENCE ──────────────────────────
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Presence ON:", err.message);
      }

      const onlineUsers = await User.find({ isOnline: true }).select("_id");
      io.emit("presence:update", onlineUsers);
    }

    // ───────────────────────── PROJECT ROOMS ─────────────────────
    // socket.on("join-project", (id) => id && socket.join(id));
    // Join project once
    // Join project once
    socket.on("join-project", (projectId) => {
      if (!projectId) return;
      socket.join(`project:${projectId}`);
    });

    // Leave project
    socket.on("leave-project", (projectId) => {
      if (!projectId) return;
      socket.leave(`project:${projectId}`);
    });

    // Broadcast cursor movement
    socket.on("cursor-move", ({ projectId, cursor }) => {
      if (!projectId || !cursor) return;

      socket.to(`project:${projectId}`).emit("cursor-move", {
        userId: socket.user?._id,
        cursor,
      });
    });
    

    // ───────────────────────── CHANNEL ROOMS ─────────────────────
    socket.on("join-channel", (id) => id && socket.join(`channel:${id}`));
    socket.on("leave-channel", (id) => id && socket.leave(`channel:${id}`));

    // ───────────────────────── YJS CRDT ROOM ─────────────────────
    socket.on("join-room", (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      socket.currentRoom = roomId;

      const ydoc = getYDoc(roomId);
      const update = Y.encodeStateAsUpdate(ydoc);
      socket.emit("sync", update);
    });

    socket.on("update", (updateBuf) => {
      const roomId = socket.currentRoom;
      if (!roomId) return;

      const ydoc = getYDoc(roomId);
      Y.applyUpdate(ydoc, new Uint8Array(updateBuf));
      socket.to(roomId).emit("sync", updateBuf);
    });

    
    // ───────────────────────── CANVAS REALTIME ───────────────────

    // Legacy simple room join (NEW)
    socket.on("join-myroom", (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
    });

    // Legacy simple canvas broadcast (NEW)
    socket.on("mycanvas-update", ({ roomId, data }) => {
      if (!roomId) return;
      socket.to(roomId).emit("canvas-update", data);
    });

    // Legacy cursor broadcast (NEW)
    socket.on("mycursor-move", ({ roomId, cursor }) => {
      if (!roomId) return;
      socket.to(roomId).emit("cursor-move", cursor);
    });


    // Advanced Canvas Presence System (EXISTING UPGRADED)

    socket.on("join-canvas", ({ canvasId, user }) => {
      if (!canvasId) return;

      socket.join(canvasId);

      if (!canvasRooms[canvasId]) canvasRooms[canvasId] = {};

      canvasRooms[canvasId][socket.id] = {
        id: socket.id,
        userId,
        name: user?.name || "Anonymous",
        cursor: { x: 0, y: 0 },
        selection: null,
      };

      io.to(canvasId).emit(
        "presence-update",
        Object.values(canvasRooms[canvasId])
      );
    });

    socket.on("canvas-update", ({ canvasId, payload }) => {
      if (!canvasId) return;

      socket.to(canvasId).emit("remote-update", payload);
    });

    socket.on("cursor-move", ({ canvasId, cursor }) => {
      if (!canvasRooms[canvasId]?.[socket.id]) return;

      canvasRooms[canvasId][socket.id].cursor = cursor;

      io.to(canvasId).emit(
        "cursor-update",
        Object.values(canvasRooms[canvasId])
      );
    });

    socket.on("selection:update", ({ canvasId, nodeId }) => {
      if (!canvasRooms[canvasId]?.[socket.id]) return;

      canvasRooms[canvasId][socket.id].selection = nodeId;

      socket.to(canvasId).emit("selection:update", {
        userId,
        nodeId,
      });
    });

    socket.on("selection:clear", ({ canvasId }) => {
      if (!canvasRooms[canvasId]?.[socket.id]) return;

      canvasRooms[canvasId][socket.id].selection = null;

      socket.to(canvasId).emit("selection:clear", { userId });
    });

    socket.on("canvas:op", ({ channel, op }) => {
      if (channel && op) {
        socket.to(channel).emit("canvas:op", op);
      }
    });

    // ───────────────────────── CANVAS COMMENTS ───────────────────
    socket.on("canvas:comment:add", (d) =>
      d?.channel && socket.to(d.channel).emit("canvas:comment:new", d)
    );

    socket.on("canvas:comment:resolve", (d) =>
      d?.channel && io.to(d.channel).emit("canvas:comment:resolved", d)
    );

    socket.on("canvas:comment:pin", (d) =>
      d?.channel && io.to(d.channel).emit("canvas:comment:pinned", d)
    );

    // External canvas handlers
    registerCanvas(io, socket);

    // ───────────────────────── BOARD EVENTS ──────────────────────
    socket.on("card-move", (d) =>
      d?.project && io.to(d.project).emit("card:moved", d)
    );

    socket.on("list-reorder", (d) =>
      d?.project && io.to(d.project).emit("list-reordered", d)
    );

    socket.on("subtask:updated", (d) =>
      d?.project && io.to(d.project).emit("subtask:updated", d)
    );

    // ───────────────────────── NOTES ─────────────────────────────
    socket.on("note:join", ({ noteId, user }) => {
      if (!noteId) return;

      socket.join(noteId);

      if (!noteRooms[noteId]) noteRooms[noteId] = {};
      noteRooms[noteId][socket.id] = user;

      io.to(noteId).emit("note:presence", noteRooms[noteId]);
    });

    socket.on("note:leave", (noteId) => {
      if (!noteId) return;

      delete noteRooms[noteId]?.[socket.id];
      io.to(noteId).emit("note:presence", noteRooms[noteId] || {});
    });

    socket.on("note:patch", (d) =>
      d?.noteId && socket.to(d.noteId).emit("note:update", d)
    );

    socket.on("note:create", (d) =>
      d?.project && io.to(d.project).emit("note:created", d)
    );

    socket.on("note:update", (d) =>
      d?.project && io.to(d.project).emit("note:updated", d)
    );

    socket.on("note:delete", (d) =>
      d?.project && io.to(d.project).emit("note:deleted", d)
    );

    // ───────────────────────── MESSAGES ──────────────────────────
    socket.on("message:send", async (data) => {
      try {
        const mentions = await extractMentions(data.content);

        const msg = await Message.create({
          ...data,
          sender: userId,
          mentions,
        });

        await notifyMention(mentions, userId, "Message", msg._id);
        await notifyUsers(mentions, {
          type: "message_mention",
          actor: userId,
          refModel: "Message",
          refId: msg._id,
        });

        await log({
          project: data.project,
          actor: userId,
          type: "message",
          entity: "Message",
          entityId: msg._id,
        });

        io.to(data.channel).emit("message:new", msg);
      } catch (err) {
        socket.emit("error", {
          event: "message:send",
          message: err.message,
        });
      }
    });

    socket.on("thread:reply", async (data) => {
      try {
        const mentions = await extractMentions(data.content);

        const reply = await Thread.create({
          ...data,
          sender: userId,
          mentions,
        });

        await notifyMention(mentions, userId, "Thread", reply._id);

        if (data.parentMessage) {
          await Message.findByIdAndUpdate(data.parentMessage, {
            $inc: { threadCount: 1 },
          });
        }

        io.to(data.channel).emit("thread:new", reply);
      } catch (err) {
        socket.emit("error", {
          event: "thread:reply",
          message: err.message,
        });
      }
    });

    // ───────────────────────── REACTIONS ─────────────────────────
    socket.on("reaction:add", async (d) => {
      try {
        await Reaction.create({ ...d, user: userId });
        io.to(d.channel).emit("reaction:added", d);
      } catch {}
    });

    socket.on("reaction:remove", async (d) => {
      try {
        await Reaction.deleteOne({ ...d, user: userId });
        io.to(d.channel).emit("reaction:removed", d);
      } catch {}
    });

    // ───────────────────────── TYPING ────────────────────────────
    socket.on("typing:start", (d) =>
      d?.channel && socket.to(d.channel).emit("typing:start", d)
    );

    socket.on("typing:stop", (d) =>
      d?.channel && socket.to(d.channel).emit("typing:stop", d)
    );

    /*
    socket.on("canvas-activity", async (payload) => {
      try {
        const activity = await recordActivity({
          ...payload,
          userId,
          username: socket.user?.name
        });

        io.to(payload.canvasId).emit("activity-update", activity);
      } catch (err) {
        socket.emit("error", {
          event: "canvas-activity",
          message: err.message
        });
      }
    });
    */

   

    // ───────────────────────── DISCONNECT ────────────────────────
    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);
      console.log("User disconnected");

      // Cleanup canvas presence
      Object.keys(canvasRooms).forEach((canvasId) => {
        if (canvasRooms[canvasId]?.[socket.id]) {
          delete canvasRooms[canvasId][socket.id];
          io.to(canvasId).emit(
            "presence-update",
            Object.values(canvasRooms[canvasId])
          );
        }
      });

      // Cleanup note presence
      Object.keys(noteRooms).forEach((noteId) => {
        if (noteRooms[noteId]?.[socket.id]) {
          delete noteRooms[noteId][socket.id];
          io.to(noteId).emit("note:presence", noteRooms[noteId]);
        }
      });

      // Update user presence
      if (userId) {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        const updated = await User.find({ isOnline: true }).select("_id");
        io.emit("presence:update", updated);
      }
    });
  });

  return io;
};








/*
const { Server } = require("socket.io");
const { setIO } = require("./io");
const authSocket = require("./authSocket");

const User = require("../models/User");
const Message = require("../models/Message");
const Thread = require("../models/Thread");
const Reaction = require("../models/Reaction");

const registerCanvas = require("./canvasRealtime");
const registerCanvasSocket = require("./canvasSocket");

const { extractMentions } = require("../utils/mentionParser");
const { notifyMention } = require("../services/notificationService");
const { notifyUsers } = require("../services/notificationService");
const { log } = require("../services/activityService");

const Y = require("yjs");
const { getYDoc } = require("../services/crdtService");

// noteRooms tracks presence per note: { [noteId]: { [socketId]: user } }
const noteRooms = {};

module.exports = (server) => {
  // ── ONE Socket.IO server for the whole application ───────────────────────
  const io = new Server(server, {
    cors: { origin: "*" },
    // Allow polling fallback so clients behind restrictive proxies still work
    transports: ["websocket", "polling"],
  });

  setIO(io);
  global.io = io;

  io.use(authSocket);

  

  io.on("connection", (socket) => {

    socket.on("cursor-move", ({ roomId, cursor }) => {
      socket.to(roomId).emit("cursor-update", {
        userId: socket.id,
        ...cursor
      });
    });

  });

  io.on("connection", async (socket) => {
    console.log("Socket connected:", socket.id);

    const userId = socket.user?._id?.toString();
    // ───────────────────────────────
    // USER ROOM (notifications)
    // ───────────────────────────────
    if (userId) {
      socket.join(`user:${userId}`);
      socket.join(userId); // backward compatibility
    }

    socket.on("join-user", (uid) => {
      if (!uid) return;
      socket.join(`user:${uid}`);
    });

    // Every user joins a personal room for DMs / notifications
    socket.join(userId);

    // ── Presence ───────────────────────────────────────────────────────────
    try {
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      });
    } catch (err) {
      console.error("Presence ON:", err.message);
    }

    const onlineUsers = await User.find({ isOnline: true }).select("_id");
    io.emit("presence:update", onlineUsers);

    socket.on("disconnect", async () => {
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Presence OFF:", err.message);
      }

      const updated = await User.find({ isOnline: true }).select("_id");
      io.emit("presence:update", updated);

      // Clean up note presence for this socket
      Object.keys(noteRooms).forEach(noteId => {
        if (noteRooms[noteId]?.[socket.id]) {
          delete noteRooms[noteId][socket.id];
          io.to(noteId).emit("note:presence", noteRooms[noteId]);
        }
      });

      // Clean up canvas presence
      Object.keys(canvasRooms).forEach(canvasId => {
        if (canvasRooms[canvasId]?.[socket.id]) {
          delete canvasRooms[canvasId][socket.id];
          io.to(canvasId).emit("presence-update",
            Object.values(canvasRooms[canvasId])
          );
        }
      });
    });

    // ───────────────────────────────
    // CHANNEL ROOM (canvas realtime)
    // ───────────────────────────────
    socket.on("join-channel", (channelId) => {
      if (!channelId) return;
      socket.join(`channel:${channelId}`);
    });

    socket.on("leave-channel", (channelId) => {
      if (!channelId) return;
      socket.leave(`channel:${channelId}`);
    });

    // ───────────────────────────────
    // CANVAS PRESENCE
    // ───────────────────────────────
    socket.on("join-canvas", ({ channelId, user }) => {
      if (!channelId) return;

      socket.join(`channel:${channelId}`);

      if (!canvasRooms[channelId]) canvasRooms[channelId] = {};

      canvasRooms[channelId][socket.id] = {
        id: socket.id,
        userId,
        name: user?.name || "Anonymous",
        cursor: { x: 0, y: 0 },
        selection: null,
      };

      io.to(`channel:${channelId}`).emit(
        "presence:update",
        Object.values(canvasRooms[channelId])
      );
    });

    // ── Rooms ──────────────────────────────────────────────────────────────
    socket.on("join-project", id => id && socket.join(id));
    
    socket.on("leave-project", id => id && socket.leave(id));

    // ── Yjs CRDT rooms (used by Fabric canvas via useCanvasEngine) ─────────
    socket.on("join-room", roomId => {
      if (!roomId) return;

      socket.join(roomId);

      const ydoc = getYDoc(roomId);
      const update = Y.encodeStateAsUpdate(ydoc);
      socket.emit("sync", update);

      socket.on("update", updateBuf => {
        Y.applyUpdate(ydoc, new Uint8Array(updateBuf));
        socket.to(roomId).emit("sync", updateBuf);
      });
    });

    // ── Canvas presence (Fabric canvas rooms) ─────────────────────────────
    socket.on("join-canvas", ({ canvasId, user }) => {
      if (!canvasId) return;

      socket.join(canvasId);

      if (!canvasRooms[canvasId]) canvasRooms[canvasId] = {};
      canvasRooms[canvasId][socket.id] = {
        id: socket.id,
        name: user?.name || "Anonymous",
        cursor: { x: 0, y: 0 },
      };

      io.to(canvasId).emit("presence-update",
        Object.values(canvasRooms[canvasId])
      );
    });

    socket.on("canvas-update", ({ canvasId, payload }) => {
      if (!canvasId) return;
      socket.to(canvasId).emit("remote-update", payload);
    });

    socket.on("cursor-move", ({ canvasId, cursor }) => {
      if (!canvasRooms[canvasId]?.[socket.id]) return;
      canvasRooms[canvasId][socket.id].cursor = cursor;
      io.to(canvasId).emit("cursor-update",
        Object.values(canvasRooms[canvasId])
      );
    });

    // ── Canvas node selection (collaborative awareness) ────────────────────
    socket.on("selection:update", ({ channelId, nodeId }) => {
      socket.to(`channel:${channelId}`).emit("selection:update", {
        userId,
        nodeId,
      });
    });

    socket.on("selection:clear", ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit("selection:clear", {
        userId,
      });
    });

    // ── Cursor broadcast (node canvas) ─────────────────────────────────────
    socket.on("cursor:update", ({ channelId, x, y }) => {
      if (!canvasRooms[channelId]?.[socket.id]) return;

      canvasRooms[channelId][socket.id].cursor = { x, y };

      socket.to(`channel:${channelId}`).emit("cursor:update", {
        userId,
        x,
        y,
      });
    });

    // ── Canvas CRDT ops (node-based canvas, e.g. CanvasBoard) ─────────────
    socket.on("canvas:op", ({ channel, op }) => {
      if (!channel || !op) return;
      socket.to(channel).emit("canvas:op", op);
    });

    // ── Canvas comments ────────────────────────────────────────────────────
    socket.on("canvas:comment:add", d => {
      if (!d?.channel) return;
      socket.to(d.channel).emit("canvas:comment:new", d);
    });

    socket.on("canvas:comment:resolve", d => {
      if (!d?.channel) return;
      io.to(d.channel).emit("canvas:comment:resolved", d);
    });

    socket.on("canvas:comment:pin", d => {
      if (!d?.channel) return;
      io.to(d.channel).emit("canvas:comment:pinned", d);
    });

    // ── Register any additional canvas handlers from canvasRealtime ────────
    registerCanvas(io, socket);

    // ── Board (Trello-style) ───────────────────────────────────────────────
    socket.on("card-move", d =>
      d?.project && io.to(d.project).emit("card:moved", d)
    );

    socket.on("list-reorder", d =>
      d?.project && io.to(d.project).emit("list-reordered", d)
    );

    socket.on("subtask:updated", d => {
      if (!d?.project) return;
      io.to(d.project).emit("subtask:updated", d);
    });

    // ── Notes presence & collaboration ────────────────────────────────────
    socket.on("note:join", ({ noteId, user }) => {
      if (!noteId) return;

      socket.join(noteId);

      if (!noteRooms[noteId]) noteRooms[noteId] = {};
      noteRooms[noteId][socket.id] = user;

      io.to(noteId).emit("note:presence", noteRooms[noteId]);
    });

    socket.on("note:leave", noteId => {
      if (!noteId) return;
      delete noteRooms[noteId]?.[socket.id];
      io.to(noteId).emit("note:presence", noteRooms[noteId] || {});
    });

    socket.on("note:patch", d => {
      if (!d?.noteId) return;
      socket.to(d.noteId).emit("note:update", d);
    });

    // Project-level note events
    socket.on("comment-new",  d => d?.project && io.to(d.project).emit("comment-added", d));
    socket.on("note:create",  d => d?.project && io.to(d.project).emit("note:created",  d));
    socket.on("note:update",  d => d?.project && io.to(d.project).emit("note:updated",  d));
    socket.on("note:delete",  d => d?.project && io.to(d.project).emit("note:deleted",  d));

    // ── Messages ───────────────────────────────────────────────────────────
    socket.on("message:send", async data => {
      try {
        const mentions = await extractMentions(data.content);

        const msg = await Message.create({
          ...data,
          sender: userId,
          mentions,
        });

        await notifyMention(mentions, userId, "Message", msg._id);

        await notifyUsers(mentions, {
          type: "message_mention",
          actor: userId,
          refModel: "Message",
          refId: msg._id,
        });

        await log({
          project: data.project,
          actor: userId,
          type: "message",
          entity: "Message",
          entityId: msg._id,
        });

        io.to(data.channel).emit("message:new", msg);
      } catch (err) {
        console.error("message:send error:", err.message);
        socket.emit("error", { event: "message:send", message: err.message });
      }
    });

    // ── Thread replies ─────────────────────────────────────────────────────
    // NOTE: there were TWO thread:reply handlers in the original — merged into one
    socket.on("thread:reply", async data => {
      try {
        const mentions = await extractMentions(data.content);

        const reply = await Thread.create({
          ...data,
          sender: userId,
          mentions,
        });

        await notifyMention(mentions, userId, "Thread", reply._id);

        // Increment thread count on the parent message
        if (data.parentMessage) {
          await Message.findByIdAndUpdate(data.parentMessage, {
            $inc: { threadCount: 1 },
          });
        }

        io.to(data.channel).emit("thread:new", reply);
      } catch (err) {
        console.error("thread:reply error:", err.message);
        socket.emit("error", { event: "thread:reply", message: err.message });
      }
    });

    // ── Reactions ──────────────────────────────────────────────────────────
    socket.on("reaction:add", async d => {
      try {
        await Reaction.create({ ...d, user: userId });
        io.to(d.channel).emit("reaction:added", d);
      } catch (err) {
        console.error("reaction:add error:", err.message);
      }
    });

    socket.on("reaction:remove", async d => {
      try {
        await Reaction.deleteOne({ ...d, user: userId });
        io.to(d.channel).emit("reaction:removed", d);
      } catch (err) {
        console.error("reaction:remove error:", err.message);
      }
    });

    // ───────────────────────────────
    // DISCONNECT
    // ───────────────────────────────
    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", socket.id);

      Object.keys(canvasRooms).forEach((channelId) => {
        if (canvasRooms[channelId][socket.id]) {
          delete canvasRooms[channelId][socket.id];

          io.to(`channel:${channelId}`).emit(
            "presence:update",
            Object.values(canvasRooms[channelId])
          );
        }
      });

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
      }
    });

    // ── Typing indicators ──────────────────────────────────────────────────
    socket.on("typing:start", d => d?.channel && socket.to(d.channel).emit("typing:start", d));
    socket.on("typing:stop",  d => d?.channel && socket.to(d.channel).emit("typing:stop",  d));
  });

  // Return io so server.js can use it if needed (e.g. inject into routes)
  return io;
};

// Canvas presence rooms — module-level so disconnect handler can access them
const canvasRooms = {};
*/

