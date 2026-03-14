// src/App.jsx
import AuthProvider from "./context/AuthContext";
import SocketProvider from "./context/SocketContext";
import NotificationProvider from "./context/NotificationContext";
import ActivityProvider from "./context/ActivityContext";
import AppRouter from "./routes/AppRouter";
import { ChatProvider } from "./modules/chat/ChatStore";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <ActivityProvider>
            <ChatProvider>
              <AppRouter />
            </ChatProvider>
          </ActivityProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

