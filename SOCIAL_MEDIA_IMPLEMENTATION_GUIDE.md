# Social Media Management Implementation Guide

This document maps the full implementation that was requested (backend + frontend) so you can verify quickly in GitHub before running locally.

## 1) Backend implementation map

### Models
- `server/models/SocialPost.js`
  - Stores social post draft/publish lifecycle, platforms, rich content (`contentHtml`), media attachments, scheduling, assignees, tags, and embedded post notes.
- `server/models/SocialTask.js`
  - Stores task manager items with kanban status (`todo`, `in_progress`, `review`, `done`), priority, due date, assignees, and optional social-post linkage.
- `server/models/SocialDiscussion.js`
  - Stores group discussion/context messages per project/channel/social post with importance markers.

### Controller
- `server/controllers/socialMediaController.js`
  - `overview` (posts + tasks + discussions)
  - `createPost`, `updatePost`, `removePost`
  - `schedulePost`, `publishPost`
  - `addPostNote` (canvas/context notes attached to a social post)
  - `createTask`, `updateTask`, `removeTask`
  - `createDiscussion`, `removeDiscussion`

### Routes
- `server/routes/socialMedia.js`
  - Mounted under `/api/social-media`
  - Includes project-scoped overview/create endpoints
  - Includes entity-scoped update/delete/schedule/publish/note endpoints
  - Includes validation middleware and project membership guards

### Mounted API path
- `server/app.js` mounts:
  - `app.use("/api/social-media", require("./routes/socialMedia"));`

### Security + validation middlewares used
- `server/middleware/socialEntityAccess.js`
  - Ensures post/task/discussion entity belongs to a project the current user is a member of.
- `server/middleware/validateRequest.js`
  - Returns structured `400` responses for validator failures.

---

## 2) Frontend implementation map

### Routes
In `client/src/routes/AppRouter.jsx`:
- `<Route path="social-media" element={<SocialMediaManager />} />`
- `<Route path="social-media/:channelId" element={<SocialMediaManager />} />`

### API client
- `client/src/api/socialMediaApi.js`
  - `overview`, `createPost`, `updatePost`, `schedulePost`, `publishPost`, `addPostNote`, `createTask`, `updateTask`, `createDiscussion`

### Main feature page
- `client/src/pages/social/SocialMediaManager.jsx`
  - Task manager board
  - Group discussion stream
  - Post studio + publish/schedule
  - Content calendar
  - Canvas/context notes linked to posts
  - Rollback-safe optimistic actions for task move/publish/schedule

### Rich editor (requested “ultimate editor”)
- `client/src/pages/social/SocialPostEditor.jsx`
  - Rich text editing toolbar
  - Image/video drag-and-drop
  - Media preview (including video playback)

### Modernized UI components
- `client/src/pages/social/components/SocialHeaderStats.jsx`
- `client/src/pages/social/components/FutureLabPanel.jsx`

### Styles
- `client/src/pages/social/SocialMediaManager.css`

---

## 3) Canvas + activity + notification pieces that were requested

### Canvas interaction fix (selection-first behavior)
- `client/src/hooks/useCanvasEngine.js`
  - Click does not auto-create shapes.
  - Selection/drag is default behavior.
  - `Alt + drag` pans.

### my-canvas route wrappers + shell polish
- `client/src/component/canvas/MyCanvasPageRoute.jsx`
- `client/src/component/canvas/MyCanvasPageExRoute.jsx`
- `client/src/component/canvas/MyCanvasPageExIRoute.jsx`
- `client/src/component/canvas/MyCanvasPageLayoutRoute.jsx`
- `client/src/component/canvas/CanvasRouteShell.jsx`

### Activity route wiring
- `client/src/pages/activity/ProjectActivityPage.jsx`
- `client/src/pages/activity/CanvasDashboardWrapper.jsx`
- `client/src/pages/activity/CanvasActivityDashboardRoute.jsx`
- `client/src/pages/activity/ActivityRouteRenderer.jsx`

### Notifications + right activity sidebar
- `client/src/components/notifications/NotificationBell.jsx`
- `client/src/context/NotificationContext.jsx`
- `client/src/modules/activity/ProjectActivitySidebar.jsx`
- `client/src/layouts/ProjectNavbar.jsx`
- `client/src/layouts/ProjectLayout.jsx`

---

## 4) Quick verification checklist (before local run)

### Backend checks
1. Confirm model files exist:
   - `server/models/SocialPost.js`
   - `server/models/SocialTask.js`
   - `server/models/SocialDiscussion.js`
2. Confirm route mount exists in `server/app.js`.
3. Confirm `/api/social-media` routes exist in `server/routes/socialMedia.js`.

### Frontend checks
1. Confirm social routes exist in `client/src/routes/AppRouter.jsx`.
2. Confirm `SocialMediaManager.jsx` and `SocialPostEditor.jsx` exist.
3. Confirm API wrapper exists at `client/src/api/socialMediaApi.js`.

---

## 5) Local run instructions

```bash
# 1) clone and enter repo
cd trello-slack-manager-app

# 2) install and run backend
cd server
npm install
npm run dev

# 3) in another terminal install and run frontend
cd ../client
npm install
npm run dev
```

If npm registry access is restricted in your environment, run with your organization-approved npm mirror/credentials.

---

## 6) What this guide solves

If you previously couldn’t find social model/controller/routes in GitHub, use this file to jump directly to each implementation path and verify each requested feature is present before pulling and running locally.
