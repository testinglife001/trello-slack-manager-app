# MERN Social + Canvas Improvement Roadmap

This roadmap is prioritized for practical execution and split into implementation-ready tasks.

## Priority Levels
- **P0 (Critical / immediate)**: production risk, data loss, security exposure, broken UX.
- **P1 (High)**: strong user impact, scalability, maintainability.
- **P2 (Medium)**: quality polish and productivity improvements.
- **P3 (Future)**: strategic/futuristic enhancements.

---

## 1) Critical Fixes (P0)

### Goals
Stabilize core social-media + canvas workflows so key user actions are reliable.

### Issues to address
1. Social-media update/delete routes are not consistently guarded by project membership checks.
2. API payloads are accepted without strict schema validation.
3. Canvas/social components contain large modules that are difficult to reason about and test.
4. Route-level activity wrappers exist in multiple forms and need standardized behavior contracts.

### Actionable tasks
- **T1.1** Add membership/authorization middleware to all social-media mutating endpoints.
- **T1.2** Add request validation schemas (create/update post/task/discussion, schedule/publish payloads).
- **T1.3** Add centralized API error response shape (`code`, `message`, `details`, `requestId`).
- **T1.4** Add regression tests for create/update/delete/schedule/publish flows.
- **T1.5** Remove dead/commented legacy blocks in canvas engine and board modules.

### Definition of done
- All social endpoints enforce auth + membership checks.
- Invalid payloads return 400 with structured errors.
- CI includes passing route tests for all social mutation paths.

---

## 2) Security Fixes (P0/P1)

### Goals
Reduce privilege-escalation and data-access risks across projects/channels.

### Issues to address
1. ID-based operations need project/channel ownership validation.
2. Rich content (HTML in post editor) requires sanitization before render/storage.
3. Notification/activity endpoints need strict user scoping checks.
4. Missing security observability for suspicious access patterns.

### Actionable tasks
- **T2.1** On every post/task/discussion mutation, verify the entity belongs to requester project scope.
- **T2.2** Sanitize `contentHtml` on write and/or render (allow-list tags/attributes).
- **T2.3** Add rate limiting for sensitive endpoints (publish, schedule, update loops).
- **T2.4** Add audit logs for permission failures and high-risk actions.
- **T2.5** Add security tests for cross-project access attempts.

### Definition of done
- Cross-project object access is denied consistently.
- HTML content is sanitized and tested against XSS payloads.
- Security tests run in CI.

---

## 3) Performance Improvements (P1)

### Goals
Improve responsiveness for dashboard, activity feeds, and large canvas/social datasets.

### Issues to address
1. Overview endpoints return fixed large batches without pagination controls.
2. Activity/dashboard pages load multiple resources together; expensive for large projects.
3. Some client renders can be further memoized/split by concern.
4. Canvas operation streams and comments can grow rapidly.

### Actionable tasks
- **T3.1** Add pagination and query filters (`limit`, `cursor`, `status`, `platform`) for social overview endpoints.
- **T3.2** Add DB indexes for frequent query/sort fields (`project`, `channel`, `status`, `scheduledAt`, `createdAt`).
- **T3.3** Introduce React Query (or equivalent) for caching, stale-while-revalidate, and request deduplication.
- **T3.4** Virtualize long lists (discussion/activity streams).
- **T3.5** Add websocket throttling/debouncing policies for cursor/operation-heavy events.
- **T3.6** Add performance budgets and profiling checkpoints (TTI, route load, API P95 latency).

### Definition of done
- Paginated APIs return metadata and perform within target latency.
- UI maintains smooth interaction under high item counts.
- Baseline performance metrics are tracked.

---

## 4) Architectural Refactoring (P1/P2)

### Goals
Improve maintainability by separating concerns and reducing monolith components.

### Current pain points
1. `SocialMediaManager` handles too many responsibilities (fetch, state, forms, tabs, actions).
2. Social controller mixes domain rules and transport logic.
3. Canvas modules include legacy/commented code paths.
4. Realtime activity/canvas concerns are spread across many route wrappers.

### Actionable tasks
- **T4.1** Split social manager into feature modules:
  - `useSocialOverview`
  - `useSocialPosts`
  - `useSocialTasks`
  - `useSocialDiscussions`
- **T4.2** Add server service layer:
  - `socialPostService`
  - `socialTaskService`
  - `socialDiscussionService`
- **T4.3** Add input DTO validators and mapper layer per endpoint.
- **T4.4** Standardize activity route resolution into one route adapter + typed params contract.
- **T4.5** Remove commented legacy code and create migration notes in `/docs/architecture`.

### Definition of done
- UI features are testable in isolation.
- Controller files are thin and delegate to services.
- Route/data flow contracts are documented.

---

## 5) UI Improvements (P1/P2)

### Goals
Deliver polished, predictable UX for social planning, canvas collaboration, and activity monitoring.

### Focus areas
1. Better empty/loading/error states across all social tabs.
2. More intuitive task transitions and content calendar controls.
3. Enhanced discussion UX (mentions, threads, pinning).
4. Cohesive visual system across social, canvas, activity, and notifications.

### Actionable tasks
- **T5.1** Add skeleton loaders and retry actions in social/activity views.
- **T5.2** Add drag-drop rescheduling in content calendar with conflict warnings.
- **T5.3** Add thread grouping + mention highlighting in group discussions.
- **T5.4** Add keyboard shortcuts/quick actions for post/task creation.
- **T5.5** Align spacing, typography, and cards to a shared design token set.
- **T5.6** Add accessibility pass (focus states, ARIA labels, contrast, keyboard navigation).

### Definition of done
- UX consistency is measurable via design checklist.
- Accessibility issues (critical/high) are resolved.
- Core workflows are faster with fewer clicks.

---

## Suggested Refactoring Tasks (Step-by-step Plan)

## Sprint 1 (Stability + Security)
1. Implement T1.1 + T2.1 (authorization hardening).
2. Implement T1.2 (validation schemas) for all social endpoints.
3. Add T1.3 structured error responses.
4. Add baseline integration tests for social mutation routes.

## Sprint 2 (Performance Baseline)
1. Implement T3.1 pagination/filtering.
2. Implement T3.2 DB indexes and query tuning.
3. Add client caching strategy for social overview and activity feeds.
4. Add API and page-load metrics dashboard.

## Sprint 3 (Refactor Foundation)
1. Execute T4.1 split of `SocialMediaManager` into hooks + tab components.
2. Execute T4.2 service-layer extraction on backend.
3. Remove legacy commented code and add architecture docs.

## Sprint 4 (UX and Product Depth)
1. Implement T5.1 + T5.2 + T5.3 UX upgrades.
2. Add accessibility and keyboard-navigation improvements.
3. Validate with usability pass on primary flows:
   - create post -> add note -> create task -> discussion -> schedule/publish.

## Sprint 5 (Strategic Enhancements)
1. Introduce review/approval workflow state machine for social posts.
2. Add analytics cards (throughput, scheduled vs published, task SLA).
3. Start AI-assisted features (caption variants, schedule recommendations) behind feature flags.

---

## Success Metrics
- **Reliability**: social mutation error rate < 1%.
- **Security**: 0 known cross-project data access vulnerabilities.
- **Performance**: P95 social overview API < 300ms for paginated queries.
- **UX**: reduced clicks/time-to-publish and improved task completion rate.
- **Maintainability**: reduced large-component complexity and improved test coverage.
