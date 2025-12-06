import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import ScheduleTable from '@/components/ScheduleTable';
import LoginModal from '@/components/LoginModal';
import EmployeePortal from '@/components/EmployeePortal';
import { Employee, Forecast, Schedule, ShiftRequest, RequestType } from '@/lib/types';
import { fetchEmployees, fetchForecast, setDynamicApiKey, publishSchedule } from '@/lib/lifelenz';
import { generateSchedule } from '@/lib/scheduler';
import { NotificationService } from '@/lib/notifications';

export default function Home() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Phase 4 States
  const [viewMode, setViewMode] = useState<'MANAGER' | 'EMPLOYEE'>('MANAGER');
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string>('emp-1'); // Default to first mock emp
  const [requests, setRequests] = useState<ShiftRequest[]>([]);

  const loadData = async () => {
    const [emps, fc] = await Promise.all([fetchEmployees(), fetchForecast()]);
    setEmployees(emps);
    setForecast(fc);
    if (emps.length > 0) setCurrentEmployeeId(emps[0].id);
  };

  useEffect(() => {
    // Check if API Key is configured in Env. If not, prompt user.
    if (!process.env.NEXT_PUBLIC_API_KEY) {
      setIsAuthModalOpen(true);
    } else {
      loadData();
    }
  }, []);

  const handleLogin = (key: string) => {
    setDynamicApiKey(key);
    setIsAuthModalOpen(false);
    loadData();
  };

  const handleGenerate = () => {
    setLoading(true);
    // Simulate processing time for "AI" feel
    setTimeout(() => {
      const newSchedule = generateSchedule(employees, forecast);
      setSchedule(newSchedule);
      setLoading(false);
    }, 1500);
  };

  const handlePublish = async () => {
    if (!schedule) return;

    // 1. Publish to API
    const success = await publishSchedule(schedule);

    if (success) {
      // 2. Broadcast Notifications
      await NotificationService.broadcast(schedule);
      alert('Schedule Published & Notifications Sent!');
    } else {
      alert('Failed to publish schedule.');
    }
  };

  const handleShiftMove = (shiftId: string, newDay: string, newEmployeeId: string) => {
    if (!schedule) return;

    const updatedShifts = schedule.shifts.map(shift => {
      if (shift.id === shiftId) {
        const emp = employees.find(e => e.id === newEmployeeId);
        return {
          ...shift,
          day: newDay,
          employeeId: newEmployeeId,
          employeeName: emp ? emp.name : shift.employeeName,
          role: emp ? emp.role : shift.role
        };
      }
      return shift;
    });

    setSchedule({
      ...schedule,
      shifts: updatedShifts,
      // Recalculate cost roughly
      totalLaborCost: updatedShifts.reduce((total, s) => {
        const emp = employees.find(e => e.id === s.employeeId);
        if (!emp) return total;
        const hours = parseInt(s.endTime.split(':')[0]) - parseInt(s.startTime.split(':')[0]);
        return total + (hours * emp.hourlyRate);
      }, 0)
    });
  };

  // --- Phase 4 Handlers ---

  const handleRequestSearch = (type: RequestType, day: string) => {
    const emp = employees.find(e => e.id === currentEmployeeId);
    if (!emp) return;

    const newRequest: ShiftRequest = {
      id: `req-${Date.now()}`,
      employeeId: currentEmployeeId,
      employeeName: emp.name,
      day,
      type,
      status: 'PENDING'
    };

    setRequests([...requests, newRequest]);
    alert(`Request for ${type} on ${day} submitted!`);
  };

  const handleReviewRequest = (id: string, approved: boolean) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: approved ? 'APPROVED' : 'DENIED' } : r));

    const req = requests.find(r => r.id === id);
    if (req && approved && schedule) {
      // Logic to modify schedule based on request (e.g. remove shift if OFF approved)
      if (req.type === 'OFF') {
        const updatedShifts = schedule.shifts.filter(s => !(s.employeeId === req.employeeId && s.day === req.day));
        setSchedule({ ...schedule, shifts: updatedShifts });
      }
      NotificationService.notifyRequestStatus(req.employeeId, req.type, 'APPROVED');
    } else if (req) {
      NotificationService.notifyRequestStatus(req.employeeId, req.type, 'DENIED');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <Navbar
        viewMode={viewMode}
        onToggleView={() => setViewMode(prev => prev === 'MANAGER' ? 'EMPLOYEE' : 'MANAGER')}
      />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {viewMode === 'MANAGER' ? (
          <>
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                  Manager Dashboard
                </h2>
              </div>
              <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`inline-flex items-center rounded-md bg-[var(--surface-2)] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-600 hover:bg-[var(--surface-hover)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Generating...' : 'Re-Generate'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-[var(--mcd-gold)] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                  onClick={handlePublish}
                  disabled={!schedule}
                >
                  Publish & Notify
                </button>
              </div>
            </div>

            <Dashboard schedule={schedule} requests={requests} onReviewRequest={handleReviewRequest} />

            <div className="mt-8">
              <ScheduleTable schedule={schedule} employees={employees} onShiftMove={handleShiftMove} />
            </div>
          </>
        ) : (
          /* Employee Portal View */
          <div className="mt-8">
            {/* Debug Control to Switch Employee Identity */}
            <div className="mb-6 p-4 border border-dashed border-gray-600 rounded bg-gray-900/50">
              <label className="text-xs text-gray-400 uppercase font-bold">Debug: Act as Employee</label>
              <select
                className="ml-2 bg-black text-white text-sm border border-gray-600 rounded"
                value={currentEmployeeId}
                onChange={(e) => setCurrentEmployeeId(e.target.value)}
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <EmployeePortal
              currentEmployeeId={currentEmployeeId}
              schedule={schedule}
              employees={employees}
              onRequestSearch={handleRequestSearch}
            />
          </div>
        )}
      </main>

      <LoginModal isOpen={isAuthModalOpen} onLogin={handleLogin} />
    </div>
  );
}
