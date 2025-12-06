import { Schedule, ShiftRequest } from "@/lib/types";

interface DashboardProps {
    schedule: Schedule | null;
    requests?: ShiftRequest[];
    onReviewRequest?: (id: string, approved: boolean) => void;
}

export default function Dashboard({ schedule, requests = [], onReviewRequest }: DashboardProps) {
    const cost = schedule?.totalLaborCost || 0;
    const hours = schedule?.totalHours || 0;
    const coverage = schedule?.coverageScore || 0;

    const pendingRequests = requests.filter(r => r.status === 'PENDING');

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-[var(--surface-1)] px-4 py-5 shadow sm:p-6 border border-[var(--border)]">
                <dt className="truncate text-sm font-medium text-gray-400">Total Labor Cost</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-[var(--mcd-gold)]">
                    ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-[var(--surface-1)] px-4 py-5 shadow sm:p-6 border border-[var(--border)]">
                <dt className="truncate text-sm font-medium text-gray-400">Scheduled Hours</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                    {hours.toFixed(1)} <span className="text-sm text-gray-500">hrs</span>
                </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-[var(--surface-1)] px-4 py-5 shadow sm:p-6 border border-[var(--border)]">
                <dt className="truncate text-sm font-medium text-gray-400">Coverage Score</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-[var(--mcd-red)]">
                    {coverage}% <span className="text-sm text-gray-500">efficiency</span>
                </dd>
            </div>
            {/* Pending Requests Card */}
            <div className="overflow-hidden rounded-lg bg-[var(--surface-1)] px-4 py-5 shadow sm:p-6 border border-[var(--border)]">
                <dt className="truncate text-sm font-medium text-gray-400">Pending Requests</dt>
                <dd className="mt-1">
                    {pendingRequests.length === 0 ? (
                        <span className="text-lg text-gray-500">No pending requests</span>
                    ) : (
                        <div className="space-y-2 mt-2">
                            {pendingRequests.map(req => (
                                <div key={req.id} className="bg-[var(--surface-2)] p-2 rounded text-xs">
                                    <div className="text-white font-bold">{req.employeeName}</div>
                                    <div className="text-gray-300">{req.type} - {req.day}</div>
                                    {onReviewRequest && (
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => onReviewRequest(req.id, true)} className="text-green-400 hover:underline">Approve</button>
                                            <button onClick={() => onReviewRequest(req.id, false)} className="text-red-400 hover:underline">Deny</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </dd>
            </div>
        </div>
    );
}
