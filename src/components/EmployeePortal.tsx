'use client';

import { useState } from 'react';
import { Employee, Schedule } from '@/lib/types';

interface EmployeePortalProps {
    currentEmployeeId: string;
    schedule: Schedule | null;
    employees: Employee[];
    onRequestSearch: (type: 'OFF' | 'PICKUP', day: string) => void;
}

export default function EmployeePortal({ currentEmployeeId, schedule, employees, onRequestSearch }: EmployeePortalProps) {
    const [selectedDay, setSelectedDay] = useState('Monday');

    const employee = employees.find(e => e.id === currentEmployeeId);
    if (!employee) return <div className="text-red-500">Employee not found. Please select a valid employee from the debug menu.</div>;

    const myShifts = schedule?.shifts.filter(s => s.employeeId === currentEmployeeId) || [];

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-[var(--surface-1)] p-6 border border-[var(--border)]">
                <h2 className="text-xl font-bold text-white mb-2">Welcome, {employee.name}</h2>
                <p className="text-gray-400">Role: {employee.role} | Max Hours: {employee.maxHoursPerWeek}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* My Shifts */}
                <div className="rounded-lg bg-[var(--surface-1)] p-6 border border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--mcd-gold)] mb-4">My Upcoming Shifts</h3>
                    {myShifts.length === 0 ? (
                        <p className="text-gray-400">No shifts assigned yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {myShifts.map(shift => (
                                <li key={shift.id} className="flex justify-between items-center bg-[var(--surface-2)] p-3 rounded">
                                    <span className="text-white font-medium">{shift.day}</span>
                                    <span className="text-gray-300">{shift.startTime} - {shift.endTime}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Request Action */}
                <div className="rounded-lg bg-[var(--surface-1)] p-6 border border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-white mb-4">Request Helper</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Day</label>
                            <select
                                value={selectedDay}
                                onChange={(e) => setSelectedDay(e.target.value)}
                                className="block w-full rounded-md border-0 bg-[var(--surface-2)] py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-[var(--mcd-gold)] sm:text-sm sm:leading-6"
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => onRequestSearch('OFF', selectedDay)}
                                className="flex-1 rounded bg-red-900/50 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-900/70 border border-red-700"
                            >
                                Request Time Off
                            </button>
                            <button
                                onClick={() => onRequestSearch('PICKUP', selectedDay)}
                                className="flex-1 rounded bg-green-900/50 px-3 py-2 text-sm font-semibold text-green-200 hover:bg-green-900/70 border border-green-700"
                            >
                                Request Pickup
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
