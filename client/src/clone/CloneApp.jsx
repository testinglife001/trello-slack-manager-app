import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import TableView from './TableView';
import KanbanView from './KanbanView';
import CalendarView from './CalendarView';
import TaskDetail from './TaskDetail';

const CloneApp = () => {
  const [activeView, setActiveView] = useState('table');
  const [selectedTask, setSelectedTask] = useState(null);

  const renderView = () => {
    switch (activeView) {
      case 'table':
        return <TableView onTaskClick={(task) => setSelectedTask(task)} />;
      case 'kanban':
        return <KanbanView onTaskClick={(task) => setSelectedTask(task)} />;
      case 'calendar':
        return <CalendarView onTaskClick={(task) => setSelectedTask(task)} />;
      default:
        return <TableView onTaskClick={(task) => setSelectedTask(task)} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <Header activeView={activeView} onViewChange={setActiveView} />

        {/* View Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {renderView()}
        </div>

        {/* Task Detail Panel */}
        {selectedTask && (
          <TaskDetail 
            task={selectedTask} 
            onClose={() => setSelectedTask(null)} 
          />
        )}
      </div>
    </div>
  );
};

export default CloneApp;
