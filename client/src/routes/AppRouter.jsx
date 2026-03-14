// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AuthGate from "./AuthGate";
import { useAuth } from "../context/AuthContext";
import Dashboard from "../pages/dashboard/Dashboard";
import ProjectLayout from "../layouts/ProjectLayout";
import BoardPage from "../pages/board/BoardPage";
import ChannelPage from "../pages/channel/ChannelPage";
import CanvasPage from "../pages/canvas/CanvasPage";
import PlaybackPage from "../pages/canvas/PlaybackPage";
import NotesPage from "../pages/notes/NotesPage";
import CreateNotePage from "../modules/notes/CreateNotePage";
import NoteDetailsPage from "../pages/notes/NoteDetailsPage";

import MyCanvasPageRoute from "../component/canvas/MyCanvasPageRoute";
import MyCanvasPageLayoutRoute from "../component/canvas/MyCanvasPageLayoutRoute";
import MyCanvasPageExRoute from "../component/canvas/MyCanvasPageExRoute";
import ProjectActivityPage from "../pages/activity/ProjectActivityPage";
import CanvasDashboardWrapper from "../pages/activity/CanvasDashboardWrapper";
import DashboardI from "../bordio/pages/DashboardI";
import DashboardII from "../bordio/pages/DashboardII";
import DashboardIII from "../bordio/pages/DashboardIII";
import DashboardIV from "../bordio/pages/DashboardIV";
import DashboardApp from "../bordio/pages/DashboardApp";
import DashboardV from "../bordio/pages/DashboardV";
import CloneApp from "../clone/CloneApp";
import SocialMediaManager from "../pages/social/SocialMediaManager";
import MyCanvasPageExIRoute from "../component/canvas/MyCanvasPageExIRoute";

// Bordio pages for DashboardV
import CalendarPage from "../bordio/pages/pages/CalendarPage";
import TableViewPage from "../bordio/pages/pages/TableViewPage";
import KanbanPage from "../bordio/pages/pages/KanbanPage";
import GanttPage from "../bordio/pages/pages/GanttPage";
import TaskDetailPage from "../bordio/pages/pages/TaskDetailPage";

// New Task pages
import TaskListPage from "../pages/tasks/TaskListPage";
import TaskDetailsPage from "../pages/tasks/TaskDetailsPage";
import ProjectCalendarPage from "../pages/project/ProjectCalendarPage";
import ProjectGanttPage from "../pages/project/ProjectGanttPage";

// NEW PROJECT PAGES
import ProjectInboxPage from "../pages/project/ProjectInboxPage";
import ProjectAnalyticsPage from "../pages/project/ProjectAnalyticsPage";
import ProjectSettingsPage from "../pages/project/ProjectSettingsPage";
import UserProfilePage from "../pages/project/UserProfilePage";
import AIEditorWorkspace from "../pages/project/AIEditorWorkspace";

import RootLayout from "../layouts/RootLayout";

import ProjectProvider from "../context/ProjectContext";
import TaskDetailsModal from "../pages/tasks/TaskDetailsModal";
import NotificationToasts from "../components/notifications/NotificationToasts";
import CanvasActivityDashboard from "../pages/activity/CanvasActivityDashboard";

function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
            <PublicOnly>
                <LoginPage />
            </PublicOnly>
        } />

        <Route path="/register" element={
            <PublicOnly>
                <RegisterPage />
            </PublicOnly>
        } />

        <Route
          path="/projects/:projectId"
          element={
            <AuthGate>
              <ProjectProvider>
                <ProjectLayout />
              </ProjectProvider>
            </AuthGate>
          }
        >
          <Route index element={<div>Select something</div>} />
          <Route path="boards/:boardId" element={<BoardPage />} />
          <Route path="channels/:channelId" element={<ChannelPage />} />
          <Route path="canvas/:channelId" element={<CanvasPage />} />
          <Route path="canvas/:channelId/playback" element={<PlaybackPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="notes/new" element={<CreateNotePage />} />
          <Route path="notes/:noteId" element={<NoteDetailsPage />} />

          {/* Project Task Routes (Populated by Cards) */}
          <Route path="tasks" element={<TaskListPage />}>
             <Route path=":taskId" element={<TaskDetailsModal />} />
          </Route>
          
          <Route path="calendar" element={<ProjectCalendarPage />}>
             <Route path="tasks/:taskId" element={<TaskDetailsModal />} />
          </Route>

          <Route path="gantt" element={<ProjectGanttPage />}>
             <Route path="tasks/:taskId" element={<TaskDetailsModal />} />
          </Route>

          <Route path="boards/:boardId" element={<BoardPage />}>
             <Route path="tasks/:taskId" element={<TaskDetailsModal />} />
          </Route>
          <Route path="analytics" element={<ProjectAnalyticsPage />} />
          <Route path="ai-editor" element={<AIEditorWorkspace />} />
          <Route path="settings" element={<ProjectSettingsPage />} />
          
          <Route path="social-media" element={<SocialMediaManager />} />
          <Route path="social-media/:channelId" element={<SocialMediaManager />} />

          <Route path="my-canvas/:channelId" element={<MyCanvasPageRoute/>}/>
          <Route path="my-canvas-ex/:channelId" element={<MyCanvasPageExRoute/>}/>
          <Route path="my-canvas-ex-i/:channelId" element={<MyCanvasPageExIRoute/>}/>
          <Route path="my-canvas-layout/:channelId" element={<MyCanvasPageLayoutRoute/>}/>

          {/*<Route path="activity" element={<ProjectActivityPage />} />
          <Route path="activity-canvas/:channelId" element={<CanvasDashboardWrapper />} />*/}
        </Route>

        {/* Root dashboard */}
        <Route path="/" element={
          <AuthGate>
            <>
              <NotificationToasts />
              <Dashboard />
            </>
          </AuthGate>
        } />

        
        {/* Project activity */}
        <Route path="/projects/:projectId/canvas/:channelId/activity" element={<ProjectActivityPage />} />
        <Route path="/canvas/:projectId/:channelId" element={<CanvasDashboardWrapper />} />
        <Route path="/:projectId/:channelId/canvas" element={<CanvasActivityDashboard />} />
        
      
        <Route
          path="/"
          element={
            <AuthGate>
               <RootLayout />
            </AuthGate>
          }
        >
           <Route index element={<Dashboard />} />
           <Route path="ai-editor" element={<AIEditorWorkspace />} />
           <Route path="tasks" element={<TaskListPage />} />
           <Route path="notes" element={<NotesPage />} />
           <Route path="notes/new" element={<CreateNotePage />} />
           <Route path="notes/:noteId" element={<NoteDetailsPage />} />
           <Route path="inbox" element={<div>Unified Inbox</div>} />
           <Route path="calendar" element={<div>Global Calendar</div>} />
           <Route path="analytics" element={<div>Global Analytics</div>} />
           <Route path="profile" element={<UserProfilePage />} />
           <Route path="settings" element={<div>Settings Page</div>} />
        </Route>

        <Route path="/dashboard-i" element={<DashboardI />} />
        <Route path="/dashboard-ii" element={<DashboardII />} />
        <Route path="/dashboard-iii" element={<DashboardIII />} />
        <Route path="/dashboard-iv" element={<DashboardIV />} />
        <Route path="/dashboard-app" element={<DashboardApp />} />
        
        <Route path="/dashboard-v/:projectId/:boardId" element={<DashboardV />}>
          <Route index element={<Navigate to="table" replace />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="table" element={<TableViewPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="gantt" element={<GanttPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        </Route>

        <Route path="/dashboard-v" element={<DashboardV />}>
          <Route index element={<Navigate to="table" replace />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="table" element={<TableViewPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="gantt" element={<GanttPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
        </Route>

        <Route path="/clone-app" element={<CloneApp />} />
      </Routes>
    </BrowserRouter>
  );
}
