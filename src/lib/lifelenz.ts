import { Employee, Forecast, Schedule } from './types';
import { MOCK_EMPLOYEES, generateMockForecast } from './lifelenz'; // Start keeping mocks as fallback

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.lifelenz.com/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
};

export const fetchEmployees = async (): Promise<Employee[]> => {
    try {
        if (!API_KEY) throw new Error("No API Key");

        const res = await fetch(`${API_BASE_URL}/employees`, { headers });
        if (!res.ok) throw new Error('Failed to fetch employees');

        const data = await res.json();
        // Transform data if necessary to match Employee interface
        return data.map((e: any) => ({
            id: e.id,
            name: e.fullName,
            role: e.jobTitle,
            maxHoursPerWeek: e.weeklyLimit || 40,
            availability: e.availability || {}, // Expecting simplified map
            hourlyRate: e.rate || 15.0
        }));

    } catch (error) {
        console.warn("API Fetch Failed or Config Missing, falling back to mock data.", error);
        return new Promise((resolve) => setTimeout(() => resolve(MOCK_EMPLOYEES), 400));
    }
};

export const fetchForecast = async (): Promise<Forecast[]> => {
    try {
        if (!API_KEY) throw new Error("No API Key");

        const res = await fetch(`${API_BASE_URL}/forecast/labor`, { headers });
        if (!res.ok) throw new Error('Failed to fetch forecast');

        const data = await res.json();
        return data;
    } catch (error) {
        console.warn("API Fetch Failed, falling back to mock.", error);
        return new Promise((resolve) => setTimeout(() => resolve(generateMockForecast()), 400));
    }
};

export const publishSchedule = async (schedule: Schedule): Promise<boolean> => {
    try {
        if (!API_KEY) {
            console.log("Mock Publish: Success");
            return true;
        }

        const res = await fetch(`${API_BASE_URL}/schedules`, {
            method: 'POST',
            headers,
            body: JSON.stringify(schedule)
        });

        if (!res.ok) throw new Error('Failed to publish');
        return true;
    } catch (error) {
        console.error("Publish failed", error);
        return false;
    }
};

// Export mocks just in case other files need them explicitly
export { MOCK_EMPLOYEES, generateMockForecast };
