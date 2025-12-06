import { generateSchedule } from '../lib/scheduler';
import { MOCK_EMPLOYEES, generateMockForecast } from '../lib/lifelenz';

console.log('Starting Scheduler Verification...');

const employees = MOCK_EMPLOYEES;
const forecast = generateMockForecast();

console.log(`Loaded ${employees.length} employees`);
console.log(`Loaded ${forecast.length} forecast entries`);

const start = performance.now();
const schedule = generateSchedule(employees, forecast);
const end = performance.now();

console.log('Schedule generated in', (end - start).toFixed(2), 'ms');
console.log('Week ID:', schedule.weekId);
console.log('Total Shifts:', schedule.shifts.length);
console.log('Total Labor Cost:', schedule.totalLaborCost);

if (schedule.shifts.length === 0) {
    console.warn('WARNING: No shifts generated! (Expected given current stub)');
} else {
    console.log('SUCCESS: Shifts generated.');
}

// Validation Logic (Placeholder for when real algorithm is in)
if (schedule.totalLaborCost >= 0) {
    console.log('Validation Passed: Labor Cost is non-negative');
}
