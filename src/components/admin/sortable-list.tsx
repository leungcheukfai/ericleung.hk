'use client';

import { cn } from '@/lib/utils';
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type HTMLAttributes, type ReactNode, useId } from 'react';

export type SortableHandleProps = HTMLAttributes<HTMLElement> & {
  ref: (element: HTMLElement | null) => void;
};

type SortableRenderState = {
  handleProps: SortableHandleProps;
  isDragging: boolean;
};

function SortableRow({
  id,
  className,
  children,
}: {
  id: string;
  className?: string;
  children: (state: SortableRenderState) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
      }}
      className={cn(
        'relative',
        isDragging && 'z-10 opacity-90 shadow-lg',
        className
      )}
    >
      {children({
        handleProps: {
          ...attributes,
          ...listeners,
          ref: setActivatorNodeRef,
          style: { touchAction: 'none' },
        },
        isDragging,
      })}
    </div>
  );
}

export default function SortableList<T>({
  items,
  getId,
  onMove,
  className,
  rowClassName,
  children,
}: {
  items: T[];
  getId: (item: T, index: number) => string;
  onMove: (fromIndex: number, toIndex: number) => void;
  className?: string;
  rowClassName?: string;
  children: (item: T, index: number, state: SortableRenderState) => ReactNode;
}) {
  const dndContextId = useId();
  const ids = items.map((item, index) => getId(item, index));
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) {
      return;
    }

    const fromIndex = ids.indexOf(String(active.id));
    const toIndex = ids.indexOf(String(over.id));
    if (fromIndex !== -1 && toIndex !== -1) {
      onMove(fromIndex, toIndex);
    }
  }

  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {items.map((item, index) => (
            <SortableRow
              key={ids[index]}
              id={ids[index] ?? ''}
              className={rowClassName}
            >
              {(state) => children(item, index, state)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
