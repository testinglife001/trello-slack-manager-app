// src/components/KanbanView.jsx
// src/components/KanbanView.jsx
// src/components/KanbanView.jsx
import React, { useState } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem"; // create this component below

export default function KanbanView({ tasks }) {
  const [columns, setColumns] = useState({
    "To Do": tasks.filter((t) => t.status === "To Do"),
    "In Progress": tasks.filter((t) => t.status === "In Progress"),
    "Done": tasks.filter((t) => t.status === "Done"),
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const [fromCol, taskId] = active.id.split(":");
    const [toCol, toId] = over.id.split(":");

    if (fromCol === toCol) {
      // Reorder within the same column
      const oldIndex = columns[fromCol].findIndex((t) => t.id.toString() === taskId);
      const newIndex = columns[toCol].findIndex((t) => t.id.toString() === toId);
      const newColumn = arrayMove(columns[fromCol], oldIndex, newIndex);
      setColumns({ ...columns, [fromCol]: newColumn });
    } else {
      // Move between columns
      const taskIndex = columns[fromCol].findIndex((t) => t.id.toString() === taskId);
      const task = columns[fromCol][taskIndex];

      const newFromCol = columns[fromCol].filter((t) => t.id.toString() !== taskId);
      const newToCol = [...columns[toCol], { ...task, status: toCol }];

      setColumns({ ...columns, [fromCol]: newFromCol, [toCol]: newToCol });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4">
        {Object.entries(columns).map(([colName, colTasks]) => (
          <div key={colName} className="w-1/3 bg-gray-100 p-2 rounded">
            <h3 className="font-bold mb-2">{colName}</h3>
            <SortableContext items={colTasks.map((t) => `${colName}:${t.id}`)} strategy={verticalListSortingStrategy}>
              {colTasks.map((task) => (
                <SortableItem key={task.id} id={`${colName}:${task.id}`} task={task} />
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
