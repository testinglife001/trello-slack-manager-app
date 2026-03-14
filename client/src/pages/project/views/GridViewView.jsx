import React from 'react';
import GridView from '../../../bordio/components/GridView';

const mockTasks = [
  { id: 1, title: 'Task 1' },
  { id: 2, title: 'Task 2' },
  { id: 3, title: 'Task 3' },
];

export default function GridViewView() {
  return <GridView tasks={mockTasks} />;
}
