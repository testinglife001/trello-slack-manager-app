// modules/chat/ChatStore.jsx
// modules/chat/ChatStore.jsx
import { createContext, useContext, useReducer } from "react";

const ChatContext = createContext(null);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
};

const initial = {
  byId: {},        // { [messageId]: message }
  byChannel: {},   // { [channelId]: [messageId, ...] }
  unread: {},      // { [channelId]: count }
  lastSeen: {},    // { [channelId]: timestamp }
};

function reducer(state, action) {
  switch (action.type) {

    case "LOAD_HISTORY": {
      const { channelId, messages } = action;
      const byId = { ...state.byId };
      const ids = messages.map(m => { byId[m._id] = m; return m._id; });

      return {
        ...state,
        byId,
        byChannel: { ...state.byChannel, [channelId]: ids },
      };
    }

    case "LOAD_MORE": {
      // Prepend older messages — server should respond via socket or a
      // separate fetch; this action just receives what the server sends back.
      // For now it is a no-op placeholder until the server integration is wired.
      return state;
    }

    case "NEW_MESSAGE": {
      const m = action.message;
      if (!m?.channel) return state;

      // Avoid duplicates
      const existing = state.byChannel[m.channel] || [];
      if (existing.includes(m._id)) return state;

      return {
        ...state,
        byId: { ...state.byId, [m._id]: m },
        byChannel: {
          ...state.byChannel,
          [m.channel]: [...existing, m._id],
        },
        unread: {
          ...state.unread,
          [m.channel]: (state.unread[m.channel] || 0) + 1,
        },
      };
    }

    case "READ_CHANNEL":
      return {
        ...state,
        lastSeen: { ...state.lastSeen, [action.channelId]: Date.now() },
        unread: { ...state.unread, [action.channelId]: 0 },
      };

    case "UNREAD_INC":
      return {
        ...state,
        unread: {
          ...state.unread,
          [action.channelId]: (state.unread[action.channelId] || 0) + 1,
        },
      };

    case "UPDATE_MESSAGE": {
      const m = action.message;
      if (!state.byId[m._id]) return state;
      return {
        ...state,
        byId: { ...state.byId, [m._id]: { ...state.byId[m._id], ...m } },
      };
    }

    case "DELETE_MESSAGE": {
      const { messageId, channelId } = action;
      const byId = { ...state.byId };
      delete byId[messageId];
      return {
        ...state,
        byId,
        byChannel: {
          ...state.byChannel,
          [channelId]: (state.byChannel[channelId] || []).filter(id => id !== messageId),
        },
      };
    }

    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}








/*
import { createContext, useContext, useReducer } from "react";

const ChatContext = createContext();
// export const useChat = () => useContext(ChatContext);

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
};


const initial = {
  byId: {},
  byChannel: {},
  pinned: {},
  unread: {},
  lastSeen: {}
};

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_HISTORY": {
      const { channelId, messages } = action;

      const byId = { ...state.byId };
      const ids = [];

      messages.forEach(m => {
        byId[m._id] = m;
        ids.push(m._id);
      });

      return {
        ...state,
        byId,
        byChannel: { ...state.byChannel, [channelId]: ids }
      };
    }

    case "NEW_MESSAGE": {
      const m = action.message;
      const ids = state.byChannel[m.channel] || [];

      return {
        ...state,
        byId: { ...state.byId, [m._id]: m },
        byChannel: {
          ...state.byChannel,
          [m.channel]: [...ids, m._id]
        }
      };
    }

    case "READ_CHANNEL":
      return {
        ...state,
        lastSeen: { ...state.lastSeen, [action.channelId]: Date.now() },
        unread: { ...state.unread, [action.channelId]: 0 }
      };

    case "UNREAD_INC":
      return {
        ...state,
        unread: {
          ...state.unread,
          [action.channelId]:
            (state.unread[action.channelId] || 0) + 1
        }
      };

    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}
*/

