import Link from 'next/link';

interface NavbarProps {
    viewMode: 'MANAGER' | 'EMPLOYEE';
    onToggleView: () => void;
}

export default function Navbar({ viewMode, onToggleView }: NavbarProps) {
    return (
        <nav className="border-b border-[var(--border)] bg-[var(--surface-1)]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl font-bold text-[var(--mcd-gold)]">M</span>
                            <span className="ml-1 text-xl font-bold tracking-tight text-white">Schedule<span className="text-[var(--mcd-red)]">Gen</span></span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    href="/"
                                    className="rounded-md bg-[var(--surface-hover)] px-3 py-2 text-sm font-medium text-white"
                                    aria-current="page"
                                >
                                    Dashboard
                                </Link>
                                {/* Other links omitted for brevity in MVP */}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggleView}
                            className="rounded bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            View: {viewMode}
                        </button>

                        {/* Profile dropdown */}
                        <div className="relative ml-3">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-[var(--mcd-gold)] flex items-center justify-center text-black font-bold">
                                    {viewMode === 'MANAGER' ? 'M' : 'E'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
