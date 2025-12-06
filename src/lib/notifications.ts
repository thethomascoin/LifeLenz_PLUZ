import { Schedule } from './types';

export const NotificationService = {
    broadcast: async (schedule: Schedule) => {
        console.group('📢 [NotificationService] Broadcasting Schedule');
        console.log(`Sending SMS/Email to ${schedule.shifts.length} employees...`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        schedule.shifts.forEach(shift => {
            console.log(`[SMS] To ${shift.employeeName} (${shift.employeeId}): Your shift is on ${shift.day} from ${shift.startTime} to ${shift.endTime}.`);
        });
        console.groupEnd();
        return true;
    },

    notifyRequestStatus: async (employeeId: string, type: string, status: 'APPROVED' | 'DENIED') => {
        console.log(`[SMS] To Employee ${employeeId}: Your request for ${type} has been ${status}.`);
        return true;
    }
};
