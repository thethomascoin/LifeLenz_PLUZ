'use client';

import { useState } from 'react';

interface LoginModalProps {
    isOpen: boolean;
    onLogin: (apiKey: string) => void;
}

export default function LoginModal({ isOpen, onLogin }: LoginModalProps) {
    const [key, setKey] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">

                {/* Backdrop */}
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                <div className="relative transform overflow-hidden rounded-lg bg-[var(--surface-1)] px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 border border-[var(--border)]">
                    <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
                            <svg className="h-6 w-6 text-[var(--mcd-gold)]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-base font-semibold leading-6 text-white" id="modal-title">Authentication Required</h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-400">
                                    Please enter your Lifelenz API Key to access real schedule data.
                                </p>
                                <input
                                    type="password"
                                    className="mt-4 block w-full rounded-md border-0 bg-[var(--surface-2)] py-1.5 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-[var(--mcd-gold)] sm:text-sm sm:leading-6 px-2"
                                    placeholder="Enter API Key"
                                    value={key}
                                    onChange={(e) => setKey(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-[var(--mcd-gold)] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                            onClick={() => onLogin(key)}
                            disabled={!key}
                        >
                            Access Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
