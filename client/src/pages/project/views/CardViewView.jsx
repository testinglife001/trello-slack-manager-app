import React from 'react';
import CardView from '../../../bordio/components/CardView';

const mockTasks = [
  { id: 1, title: 'Task 1' },
  { id: 2, title: 'Task 2' },
  { id: 3, title: 'Task 3' },
];

export default function CardViewView() {
  return <CardView tasks={mockTasks} />;
}
