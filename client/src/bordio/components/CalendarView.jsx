// src/components/CalendarView.jsx
import React, { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import TaskItem from "./TaskItem";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarView({ tasks }) {
  const [tasksByDay, setTasksByDay] = useState(
    days.reduce((acc, day) => {
      acc[day] = tasks.filter((t) => t.day === day);
      return acc;
    }, {})
  );

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const [fromDay, taskId] = active.id.split(":");
    const toDay = over.id;

    if (fromDay === toDay) return;

    const task = tasksByDay[fromDay].find((t) => t.id.toString() === taskId);
    const newFrom = tasksByDay[fromDay].filter((t) => t.id.toString() !== taskId);
    const newTo = [...tasksByDay[toDay], { ...task, day: toDay }];

    setTasksByDay({ ...tasksByDay, [fromDay]: newFrom, [toDay]: newTo });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div key={day} id={day} className="space-y-2 p-2 bg-gray-100 rounded min-h-[300px]">
            <h3 className="font-bold text-center">{day}</h3>
            {tasksByDay[day].map((task) => (
              <div key={task.id} id={`${day}:${task.id}`} className="cursor-grab">
                <TaskItem task={task} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </DndContext>
  );
}

/*
// src/components/CalendarView.jsx
import React from "react";
import TaskItem from "./TaskItem";

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function CalendarView({ tasks }) {
  const tasksByDay = days.reduce((acc, day) => {
    acc[day] = tasks.filter((t) => t.day === day);
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => (
        <div key={day} className="space-y-2">
          <h3 className="font-bold text-center">{day}</h3>
          {tasksByDay[day].map((task) => <TaskItem key={task.id} task={task} />)}
        </div>
      ))}
    </div>
  );
}
*/
