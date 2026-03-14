import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CalendarPage from './pages/CalendarPage';
import TaskDetailPage from './pages/TaskDetailPage';
import TableViewPage from './pages/TableViewPage';
import KanbanPage from './pages/KanbanPage';
import GanttPage from './pages/GanttPage';

const DashboardApp = () => {
  const [activeTab, setActiveTab] = useState('Table view');

  const renderPage = () => {
    switch (activeTab) {
      case 'Calendar':
        return <CalendarPage key="calendar" setActiveTab={setActiveTab} />;
      case 'Task Detail':
        return <TaskDetailPage key="detail" setActiveTab={setActiveTab} />;
      case 'Table view':
        return <TableViewPage key="table" setActiveTab={setActiveTab} />;
      case 'Kanban board':
        return <KanbanPage key="kanban" setActiveTab={setActiveTab} />;
      case 'Gantt':
        return <GanttPage key="gantt" setActiveTab={setActiveTab} />;
      default:
        return <TableViewPage key="table" setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f4f7fa] font-sans text-[#2d3748] overflow-hidden">
      {/* Sidebar - Shared across all pages */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardApp
;
