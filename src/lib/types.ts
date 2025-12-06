export type Role = 'Crew' | 'Manager' | 'Kitchen' | 'Service';

export interface Employee {
    id: string;
    name: string;
    role: Role;
    maxHoursPerWeek: number;
    availability: {
        [day: string]: string[]; // e.g., 'Monday': ['08:00-16:00']
    };
    hourlyRate: number;
}

export interface Shift {
    id: string;
    employeeId: string;
    employeeName: string;
    day: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    role: Role;
}

export interface Forecast {
    day: string;
    hour: number; // 0-23
    requiredStaff: number;
    projectedSales: number;
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';
export type RequestType = 'OFF' | 'PICKUP';

export interface ShiftRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    day: string;
    type: RequestType;
    status: RequestStatus;
}

export interface Schedule {
    weekId: string;
    shifts: Shift[];
    totalLaborCost: number;
    coverageScore: number; // 0-100 percentage
    totalHours: number;
}
