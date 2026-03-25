'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import DraggableWidget from './DraggableWidget';

interface Widget {
  id: string;
  title: string;
  component: React.ReactNode;
  visible: boolean;
}

interface DashboardLayoutProps {
  preprocessing: React.ReactNode;
  filters: React.ReactNode;
  stats: React.ReactNode;
  charts: React.ReactNode;
  table: React.ReactNode;
}

export default function DashboardLayout({ preprocessing, filters, stats, charts, table }: DashboardLayoutProps) {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'preprocessing', title: 'Veri Ön İşleme', component: preprocessing, visible: true },
    { id: 'filters', title: 'Filtreler ve Dışa Aktar', component: filters, visible: true },
    { id: 'stats', title: 'İstatistiksel Özet', component: stats, visible: true },
    { id: 'charts', title: 'Veri Görselleştirme', component: charts, visible: true },
    { id: 'table', title: 'Veri Tablosu', component: table, visible: true },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleVisibility = (id: string) => {
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, visible: !w.visible } : w
    ));
  };

  const visibleWidgets = widgets.filter(w => w.visible);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {widgets.map(widget => (
          <button
            key={widget.id}
            onClick={() => toggleVisibility(widget.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              widget.visible
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {widget.title}
          </button>
        ))}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={visibleWidgets.map(w => w.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {visibleWidgets.map(widget => (
              <DraggableWidget key={widget.id} id={widget.id} title={widget.title}>
                {widget.component}
              </DraggableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}