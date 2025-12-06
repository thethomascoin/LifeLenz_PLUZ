import { Employee, Schedule, Shift } from "@/lib/types";
import { DndContext, DragEndEvent, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useState } from "react";
import { CSS } from '@dnd-kit/utilities';

interface ScheduleTableProps {
    schedule: Schedule | null;
    employees: Employee[];
    onShiftMove?: (shiftId: string, newDay: string, newEmployeeId: string) => void;
}

// Draggable Shift Component
function DraggableShift({ shift }: { shift: Shift }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: shift.id,
        data: { shift }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none'
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}
            className="cursor-move rounded bg-[var(--surface-2)] border border-[var(--border)] p-2 text-center shadow-sm hover:border-[var(--mcd-gold)]">
            <div className="font-semibold text-[var(--mcd-gold)]">{shift.startTime} - {shift.endTime}</div>
            <div className="text-xs text-gray-400">{shift.role}</div>
        </div>
    );
}

// Droppable Cell Component
function DroppableCell({ day, employeeId, children, isEmpAvailable }: { day: string, employeeId: string, children: React.ReactNode, isEmpAvailable: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `${employeeId}::${day}`,
        data: { day, employeeId }
    });

    let bgClass = '';
    if (isOver) {
        bgClass = isEmpAvailable
            ? 'bg-green-900/40 ring-2 ring-inset ring-green-500'
            : 'bg-red-900/40 ring-2 ring-inset ring-red-500';
    }

    return (
        <td ref={setNodeRef} className={`whitespace-nowrap px-3 py-4 text-sm text-gray-300 transition-colors h-16 min-w-[150px] border-l border-b border-[var(--border)] ${bgClass}`}>
            {children}
        </td>
    );
}

export default function ScheduleTable({ schedule, employees, onShiftMove }: ScheduleTableProps) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const [activeShift, setActiveShift] = useState<Shift | null>(null);

    const handleDragStart = (event: any) => {
        setActiveShift(event.active.data.current?.shift);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveShift(null);

        if (over && active.id !== over.id) {
            // Parse the over id "employeeId::day"
            const [empId, day] = (over.id as string).split('::');
            if (onShiftMove) {
                onShiftMove(active.id as string, day, empId);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-[var(--border)] bg-[var(--surface-1)]">
                                <thead className="bg-[var(--surface-2)]">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">
                                            Employee
                                        </th>
                                        {days.map(day => (
                                            <th key={day} scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)] bg-[var(--surface-1)]">
                                    {employees.map((person) => (
                                        <tr key={person.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">
                                                {person.name}
                                                <div className="text-xs text-gray-500">{person.role}</div>
                                            </td>
                                            {days.map(day => {
                                                const shift = schedule?.shifts.find(s => s.employeeId === person.id && s.day === day);
                                                return (
                                                    <DroppableCell key={day} day={day} employeeId={person.id}>
                                                        {shift ? <DraggableShift shift={shift} /> : <div className="h-10 w-full"></div>}
                                                    </DroppableCell>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <DragOverlay>
                {activeShift ? (
                    <div className="cursor-grabbing rounded bg-[var(--surface-2)] border border-[var(--mcd-gold)] p-2 text-center shadow-lg opacity-80 rotate-3">
                        <div className="font-semibold text-[var(--mcd-gold)]">{activeShift.startTime} - {activeShift.endTime}</div>
                        <div className="text-xs text-gray-400">{activeShift.role}</div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
