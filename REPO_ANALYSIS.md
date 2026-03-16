# Trello Slack Manager App — Architecture & Improvement Analysis

## 1) Project overview

This is a **MERN collaboration platform** that combines:

- Trello-like work management (Projects → Boards → Lists → Cards → Subtasks)
- Slack-like communication (Channels → Messages → Threads/Reactions)
- Collaborative knowledge features (Notes, comments, mentions, activity feed, notifications)
- Real-time whiteboard/canvas editing with CRDT sync and playback/history

The backend serves REST APIs and a Socket.IO gateway; the frontend consumes both channels for CRUD + realtime UX.

---

## 2) Technology stack (MERN + realtime)

### Backend (Node/Express)

- **Express 4** HTTP API app mounted in `server/app.js`.
- **MongoDB + Mongoose** models for projects, boards, cards, notes, channels, messages, canvas, etc.
- **Socket.IO** for realtime presence, chat, notes, board signals, and canvas collaboration.
- **JWT + bcryptjs** auth stack (`auth` middleware + token/password utils).
- **Yjs CRDT** for collaborative document synchronization and periodic persistence.
- **Multer + Cloudinary** for attachment upload flows.

### Frontend (React)

- **React 18 + Vite** SPA.
- **React Router** for nested app navigation (`/projects/:projectId/...`).
- **Context providers** for auth/socket/notifications/activity/project/chat state.
- **Socket.IO client** for realtime channels/presence/canvas.

---

## 3) Folder structure and responsibilities

### `server/`

- `app.js` — Express middleware + route mounts.
- `server.js` — process bootstrap (env, DB connection, HTTP server, socket init, Yjs autosave timer).
- `routes/` — endpoint registration per domain.
- `controllers/` — HTTP request orchestration and response shaping.
- `models/` — Mongoose schemas for domain entities.
- `middleware/` — auth, membership/role checks, upload/policy guards.
- `services/` — cross-cutting behavior (notifications, activity, CRDT, search ranking).
- `sockets/` — event bus for realtime workflows.

### `client/`

- `src/App.jsx` + `src/main.jsx` — app boot and provider composition.
- `src/routes/` — full route tree and access control.
- `src/context/` — app-level state providers.
- `src/modules/` — major feature domains (board/chat/notes/canvas).
- `src/api/client.js` — authenticated request helper.
- `src/pages/`, `src/layouts/`, `src/components/` — UI composition layers.

---

## 4) Main API routes

Mounted route groups in the backend include:

- **Auth & users**: `/api/auth`
- **Project/work management**: `/api/projects`, `/api/boards`, `/api/lists`, `/api/cards`, `/api/subtasks`
- **Communication**: `/api/channels`, `/api/chat`, `/api/threads`
- **Knowledge/notes/comments**: `/api/notes`, `/api/comments`, `/api/canvas-comments`
- **Canvas**: `/api/canvas`, `/api/canvas-history`, `/api/canvas-playback`, `/api/mycanvas`
- **Activity/notifications**: `/api/activity`, `/api/canvas-activity`, `/api/notifications`, `/api/canvas-notifications`
- **Support**: `/api/attachments`, `/api/search`

---

## 5) Architecture and data flow

## A. Request/response architecture

1. Client route renders a feature page (board/chat/canvas/notes).
2. Feature module calls `request()` from `src/api/client.js`.
3. `request()` appends `Authorization: Bearer <token>` if available.
4. Express route applies middleware (`auth`, membership, role checks).
5. Controller performs DB operations via Mongoose models/services.
6. Response returns JSON to client, UI state updates.

## B. Authentication flow

1. Client logs in via `/api/auth/login` and stores `accessToken` in `localStorage`.
2. On app boot, `AuthContext` checks token and calls `/api/auth/me`.
3. Server `auth` middleware verifies JWT and injects `req.user`.
4. Protected routes use `req.user` for authorization and ownership logic.

## C. Realtime architecture (Socket.IO)

1. `SocketContext` opens a socket with token in `auth` payload.
2. Socket server authenticates via `authSocket` middleware.
3. Connection joins rooms: user rooms, project rooms, channel rooms, canvas/note rooms.
4. Features broadcast and subscribe to domain events:
   - presence updates
   - chat/messages/threads/reactions/typing
   - board reorder and card move signals
   - note presence/patch events
   - canvas updates, comments, selections, cursor movement

## D. Collaborative editing (Yjs)

1. Clients join a Yjs room (`join-room`) and receive current state as `sync` update.
2. Client updates are emitted as `update` buffers.
3. Server applies CRDT update, rebroadcasts to room peers.
4. Server autosaves in-memory docs periodically (10s interval).

## E. Canonical data model path (task domain)

`Project` → `Board` → `List` → `Card` (+ `Subtask`) with related `Activity`, `Comment`, `Attachment`, and `Notification` records.

This structure drives board screens, task pages, calendar/gantt projections, and realtime board events.

---

## 6) Key issues identified and improvements (prioritized)

## High priority

### 1) Authorization gaps on mutation routes

Some update/delete endpoints do not consistently apply project-membership and role middleware (for example, board mutation routes differ from project routes).

**Improve:** standardize policy middleware on every mutating route:
- `auth` + `isMember(...)`
- optional `roleGuard("admin")` or permission guard

### 2) Duplicate/ambiguous socket event naming

`cursor-move` is defined for multiple contexts with different payload contracts (project vs canvas), creating ambiguity.

**Improve:** namespace events and payload contracts, e.g.:
- `project:cursor-move`
- `canvas:cursor-move`

### 3) Route duplication smell in notes routes

`GET /api/notes/` appears multiple times in one router with different handlers, which can create dead code/ordering confusion.

**Improve:** one path-method per route, split into explicit endpoints (`/query`, `/mine`, etc.).

## Medium priority

### 4) Hardcoded service endpoints in frontend

API and socket URLs default to localhost literals.

**Improve:** use env-driven configuration for all environments (`VITE_API`, `VITE_SOCKET_URL`), and document required env vars.

### 5) No transaction safety in complex bulk mutations

Operations such as reorder + activity/notification side-effects can partially succeed.

**Improve:** use MongoDB sessions/transactions for multi-step mutations where consistency matters.

### 6) Presence and room naming inconsistencies

Project/channel/canvas room identifiers are mixed (prefixed in some places, raw IDs in others).

**Improve:** centralize room key helpers and enforce naming convention project-wide.

## Lower priority / maintainability

### 7) Large commented-out legacy blocks in runtime files

Many files include old commented implementations, reducing readability.

**Improve:** remove dead code and rely on version control history.

### 8) Weak validation/error consistency

Validation is partial (e.g., auth register has validators, but many mutating routes lack schema validation).

**Improve:** add centralized request validation (e.g., Zod/Joi/express-validator for all write routes).

### 9) Limited automated testing setup

Backend test script is placeholder and there is no visible CI-quality gate for APIs/socket flows.

**Improve:** add:
- unit tests (utils/services)
- integration tests (auth/projects/boards/cards)
- socket event tests
- lint + test CI pipeline

---

## 7) Recommended target architecture direction

1. **Introduce clear bounded contexts**: `auth`, `projects`, `tasks`, `chat`, `canvas`, `notes`.
2. **Enforce policy middleware matrix** for all endpoints (resource x action).
3. **Normalize event contracts** with typed event schema docs.
4. **Extract side effects** (notifications/activity) behind service interfaces and queue-heavy workloads.
5. **Adopt API contract docs** (OpenAPI) and endpoint-level request/response validation.
6. **Add tests + CI gates** before adding more feature surface.

This would retain current feature richness while significantly improving reliability, security posture, and maintainability.
