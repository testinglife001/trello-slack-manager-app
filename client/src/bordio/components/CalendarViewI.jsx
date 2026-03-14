// src/components/CalendarViewI.jsx
import React from "react";
import { SortableItem } from "./SortableItem";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarViewI({ tasksByDay }) {
  return (
    <div className="grid grid-cols-7 gap-2 p-2">
      {days.map((day) => (
        <div key={day} className="bg-gray-100 p-2 rounded min-h-[200px]">
          <h3 className="font-bold text-center mb-2">{day}</h3>
          {tasksByDay[day]?.map((task) => (
            <SortableItem key={task.id} id={`${day}:${task.id}`} task={task} />
          ))}
        </div>
      ))}
    </div>
  );
}