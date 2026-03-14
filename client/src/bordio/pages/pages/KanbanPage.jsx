import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus, 
  MoreHorizontal, 
  MessageSquare, 
  Paperclip,
  Clock,
  GripVertical,
  Play,
  Pause
} from 'lucide-react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { request } from '../../../api/client';

// --- Sortable Card Component ---
const SortableCard = ({ card, color, onToggleTimer }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden mb-3"
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Side accent color */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${color || 'bg-blue-400'}`} />
      
      <div className="space-y-3">
         <div className="text-sm font-semibold text-gray-800 leading-snug pr-4">
          {card.title}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
              <Clock className="w-3 h-3" />
              {card.dueDate ? new Date(card.dueDate).toLocaleDateString() : 'No due date'}
            </div>
            {card.timeTracked > 0 && (
              <div className={`flex items-center gap-1 text-[10px] font-bold ${card.isTimerRunning ? 'text-green-500 animate-pulse' : 'text-blue-400'}`}>
                {card.isTimerRunning ? <Pause className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                {formatTime(card.timeTracked)}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleTimer(card._id);
              }}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${card.isTimerRunning ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-gray-100 text-gray-400 hover:bg-blue-100 hover:text-blue-600 opacity-0 group-hover:opacity-100'}`}
            >
              {card.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>
            {card.assignees?.map((a, idx) => (
              <div key={idx} className={`w-6 h-6 rounded-full ${color || 'bg-blue-400'} flex items-center justify-center text-[10px] text-white font-bold border-2 border-white -ml-2 first:ml-0`}>
                {a.name?.charAt(0) || 'U'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sortable Column Component ---
const KanbanColumn = ({ list, onToggleTimer }) => {
  return (
    <div className="w-80 shrink-0 flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">{list.name}</span>
          <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">
            {list.cards?.length || 0}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
        </div>
      </div>

      {/* Column Tasks */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <SortableContext 
          id={list._id}
          items={list.cards?.map(c => c._id) || []}
          strategy={verticalListSortingStrategy}
        >
          {list.cards?.map((card, idx) => (
            <SortableCard 
              key={card._id} 
              card={card} 
              onToggleTimer={onToggleTimer}
              color={['bg-blue-400', 'bg-orange-400', 'bg-purple-400', 'bg-pink-400', 'bg-yellow-400'][idx % 5]} 
            />
          ))}
        </SortableContext>
        
        <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-xs font-semibold hover:border-gray-300 hover:text-gray-500 transition-colors flex items-center justify-center gap-2 mt-2">
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </div>
    </div>
  );
};

const KanbanPage = () => {
  const { boardId } = useParams();
  const activeBoardId = boardId || '6992477995434ce6c19991ce'; 

  const [lists, setLists] = useState([]);
  const [activeCard, setActiveCard] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadBoard = useCallback(async () => {
    try {
      const data = await request(`/boards/${activeBoardId}/full`);
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load board', err);
    }
  }, [activeBoardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setLists(prev => prev.map(list => ({
        ...list,
        cards: list.cards.map(card => {
          if (card.isTimerRunning && card.timerStartedAt) {
            const now = new Date();
            const start = new Date(card.timerStartedAt);
            const extraSeconds = Math.floor((now - start) / 1000);
            // We don't want to mutate state too often with exact seconds if we only show minutes, 
            // but for smooth UI let's just keep track of local display time
            return { ...card, displayTimeTracked: (card.timeTracked || 0) + extraSeconds };
          }
          return { ...card, displayTimeTracked: card.timeTracked };
        })
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTimer = async (taskId) => {
    try {
      await request(`/cards/${taskId}/toggle-timer`, { method: 'POST' });
      loadBoard();
    } catch (err) {
      console.error('Failed to toggle timer', err);
    }
  };

  const findListById = (id) => {
    if (lists.find(l => l._id === id)) return lists.find(l => l._id === id);
    return lists.find(l => l.cards.some(c => c._id === id));
  };

  const handleDragStart = ({ active }) => {
    const card = lists.flatMap(l => l.cards).find(c => c._id === active.id);
    setActiveCard(card);
  };

  const handleDragOver = ({ active, over }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeList = findListById(activeId);
    const overList = findListById(overId);

    if (!activeList || !overList || activeList === overList) return;

    setLists(prev => {
      const activeCards = [...activeList.cards];
      const overCards = [...overList.cards];

      const activeIndex = activeCards.findIndex(c => c._id === activeId);
      const overIndex = overCards.findIndex(c => c._id === overId);

      const [movedCard] = activeCards.splice(activeIndex, 1);
      
      let newIndex;
      if (overList._id === overId) {
        newIndex = overCards.length;
      } else {
        newIndex = overIndex >= 0 ? overIndex : overCards.length;
      }

      overCards.splice(newIndex, 0, movedCard);

      return prev.map(l => {
        if (l._id === activeList._id) return { ...l, cards: activeCards };
        if (l._id === overList._id) return { ...l, cards: overCards };
        return l;
      });
    });
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeList = findListById(activeId);
    const overList = findListById(overId);

    if (!activeList || !overList) return;

    const activeIndex = activeList.cards.findIndex(c => c._id === activeId);
    const overIndex = overList.cards.findIndex(c => c._id === overId);

    if (activeList === overList && activeIndex === overIndex) return;

    // Persist to backend
    const payload = [];
    lists.forEach(list => {
      list.cards.forEach((card, index) => {
        payload.push({
          _id: card._id,
          order: index,
          list: list._id
        });
      });
    });

    try {
      await request('/cards/reorder', {
        method: 'PUT',
        body: JSON.stringify({ cards: payload })
      });
    } catch (err) {
      console.error('Failed to sync reorder', err);
      loadBoard(); // Rollback on error
    }
  };

  return (
    <div className="flex h-full p-6 gap-6 overflow-x-auto bg-[#f4f7fa] select-none">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {lists.map(list => (
          <KanbanColumn key={list._id} list={list} onToggleTimer={handleToggleTimer} />
        ))}

        <DragOverlay>
          {activeCard ? (
            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xl opacity-90 cursor-grabbing w-80">
               <div className="text-sm font-semibold text-gray-800 leading-snug">
                {activeCard.title}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanPage;
