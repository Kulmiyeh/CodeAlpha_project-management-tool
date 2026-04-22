import { Droppable, Draggable } from '@hello-pangea/dnd';
import type { Task, Column } from '../types';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface Props {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onOpenTask: (task: Task) => void;
}

export function BoardColumn({ column, tasks, onAddTask, onOpenTask }: Props) {
  return (
    <div className="flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-900/60">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span>{column.title}</span>
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {tasks.length}
          </span>
        </div>
        <button className="btn-ghost !p-1" onClick={onAddTask} aria-label="Add task">
          <Plus size={16} />
        </button>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex min-h-[4rem] flex-1 flex-col gap-2 rounded-lg p-1 transition ${
              snapshot.isDraggingOver ? 'bg-slate-200/70 dark:bg-slate-800/60' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={task._id} index={index}>
                {(p, s) => (
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    {...p.dragHandleProps}
                    style={p.draggableProps.style}
                  >
                    <TaskCard task={task} dragging={s.isDragging} onClick={() => onOpenTask(task)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
