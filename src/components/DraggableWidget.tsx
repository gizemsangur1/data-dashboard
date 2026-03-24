'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface DraggableWidgetProps {
  id: string;
  children: React.ReactNode;
  title: string;
}

export default function DraggableWidget({ id, children, title }: DraggableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <div className="flex items-center gap-2 p-4 border-b dark:border-gray-700 cursor-move" {...attributes} {...listeners}>
        <GripVertical className="h-5 w-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}