import React from 'react';
import ListView from '../../../bordio/components/ListView';

const mockTasks = [
  { id: 1, title: 'Task 1' },
  { id: 2, title: 'Task 2' },
  { id: 3, title: 'Task 3' },
];

export default function ListViewView() {
  return <ListView tasks={mockTasks} />;
}
