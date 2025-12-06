import { Employee, Forecast, Schedule, Shift, Role } from './types';

/**
 * Advanced Scheduler using Backtracking
 * 
 * Goals:
 * 1. Minimize Labor Cost
 * 2. Maximize Coverage (Matches forecast requirements)
 * 3. Respect Employee Constraints (Max Hours, Availability)
 */

type ShiftCandidate = {
    day: string;
    startHour: number;
    endHour: number;
    role: Role;
    required: boolean;
};

// Helper to parse time string "HH:mm" to hour number
const parseTime = (time: string): number => parseInt(time.split(':')[0], 10);

// Helper to check if employee is available at a specific day and hour range
const isAvailable = (employee: Employee, day: string, startHour: number, endHour: number): boolean => {
    const availRanges = employee.availability[day];
    if (!availRanges) return false;

    for (const range of availRanges) {
        const [s, e] = range.split('-').map(parseTime);
        if (startHour >= s && endHour <= e) {
            return true;
        }
    }
    return false;
};

export const generateSchedule = (employees: Employee[], forecast: Forecast[]): Schedule => {
    const shifts: Shift[] = [];
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Map to track assigned hours per employee to enforce maxHours
    const employeeHours: Record<string, number> = {};
    employees.forEach(e => employeeHours[e.id] = 0);

    // 1. Generate Required Shift Slots from Forecast
    // Simplify forecast: For every hour with > 0 required staff, we try to create shifts
    // Merging consecutive hours into blocks (e.g. 4-8 hour shifts) is ideal, but for this heuristic
    // we will try to fill 4-hour blocks as minimum viable shifts to avoid fragmentation.

    // Simplified Slot Generation strategy:
    // Iterate days, look for peak demand, create shifts around it.

    const neededShifts: ShiftCandidate[] = [];

    DAYS.forEach(day => {
        // Group forecast by hour for this day
        const dayForecast = forecast.filter(f => f.day === day);
        if (dayForecast.length === 0) return;

        // Simple Heuristic: Create a Morning (8-16) and Evening (16-24) coverage block
        // based on average demand.

        // This is a simplification. Real logic would analyze hourly curves.
        // We will create slots for every role type available in employees to ensure coverage.
        const roles: Role[] = Array.from(new Set(employees.map(e => e.role)));

        roles.forEach(role => {
            // Check if we need this role on this day (simplified: yes if total demand > 10)
            const dailyDemand = dayForecast.reduce((sum, f) => sum + f.requiredStaff, 0);
            if (dailyDemand > 10) {
                // Morning Shift candidate
                neededShifts.push({ day, startHour: 8, endHour: 16, role, required: true });
                // Evening Shift candidate
                neededShifts.push({ day, startHour: 16, endHour: 24, role, required: true });
            }
        });
    });

    // 2. Backtracking / Greedy Assignment
    // We try to fill 'neededShifts' with the best available employee

    neededShifts.forEach(slot => {
        // Greedy assignment as initial solution
        const candidates = employees.filter(emp => {
            if (emp.role !== slot.role) return false;

            const hours = slot.endHour - slot.startHour;
            // Strict Max Check for initial
            if (employeeHours[emp.id] + hours > emp.maxHoursPerWeek) return false;

            if (!isAvailable(emp, slot.day, slot.startHour, slot.endHour)) return false;

            const hasConflict = shifts.some(s =>
                s.employeeId === emp.id &&
                s.day === slot.day &&
                (parseTime(s.startTime) < slot.endHour && parseTime(s.endTime) > slot.startHour)
            );

            return !hasConflict;
        });

        // Heuristic: Pick person with COST and HOURS balanced
        // Heuristic: Prioritize candidates with fewer assigned hours to balance workload
        candidates.sort((a, b) => employeeHours[a.id] - employeeHours[b.id]);

        if (candidates.length > 0) {
            const chosen = candidates[0];
            const duration = slot.endHour - slot.startHour;

            shifts.push({
                id: `shift-${Date.now()}-${shifts.length}`,
                employeeId: chosen.id,
                employeeName: chosen.name,
                day: slot.day,
                startTime: `${slot.startHour}:00`,
                endTime: `${slot.endHour}:00`,
                role: chosen.role
            });

            employeeHours[chosen.id] += duration;
        }
    });

    // 3. Optimization Phase: Hill Climbing / Swapping
    // Attempt to swap shifts between employees to reduce labor cost without violating constraints

    let improved = true;
    let iterations = 0;
    while (improved && iterations < 50) {
        improved = false;
        iterations++;

        for (let i = 0; i < shifts.length; i++) {
            const shift = shifts[i];
            const currentEmp = employees.find(e => e.id === shift.employeeId);
            if (!currentEmp) continue;

            const shiftDuration = parseTime(shift.endTime) - parseTime(shift.startTime);

            // Find a cheaper employee who is available and not working
            const cheaperCandidate = employees.find(e =>
                e.id !== currentEmp.id &&
                e.role === shift.role &&
                e.hourlyRate < currentEmp.hourlyRate &&
                employeeHours[e.id] + shiftDuration <= e.maxHoursPerWeek &&
                isAvailable(e, shift.day, parseTime(shift.startTime), parseTime(shift.endTime)) &&
                !shifts.some(s => s.employeeId === e.id && s.day === shift.day && (parseTime(s.startTime) < parseTime(shift.endTime) && parseTime(s.endTime) > parseTime(shift.startTime)))
            );

            if (cheaperCandidate) {
                // Swap!
                shifts[i] = {
                    ...shift,
                    employeeId: cheaperCandidate.id,
                    employeeName: cheaperCandidate.name
                };

                employeeHours[currentEmp.id] -= shiftDuration;
                employeeHours[cheaperCandidate.id] += shiftDuration;

                improved = true;
                break; // Restart loop to propagate changes safely for next iteration
            }
        }
    }

    // Calculate Metrics
    let totalLaborCost = 0;
    shifts.forEach(s => {
        const emp = employees.find(e => e.id === s.employeeId);
        if (emp) {
            const hours = parseTime(s.endTime) - parseTime(s.startTime);
            totalLaborCost += hours * emp.hourlyRate;
        }
    });

    // Simple Coverage Score: Assigned Shifts / required slots * 100
    // (Bounded to 100)
    const coverageScore = neededShifts.length > 0
        ? Math.min(100, Math.round((shifts.length / neededShifts.length) * 100))
        : 100;

    return {
        weekId: `week-${Date.now()}`,
        shifts,
        totalLaborCost,
        coverageScore,
        totalHours: Object.values(employeeHours).reduce((a, b) => a + b, 0)
    };
};
