import { Head } from '@inertiajs/react';

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            StudieLog
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Log in om verder te gaan
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
                        <button
                            type="button"
                            onClick={() => window.location.href = '/auth/microsoft/redirect'}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 23 23">
                                <path fill="#f35325" d="M1 1h10v10H1z"/>
                                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                                <path fill="#ffba08" d="M12 12h10v10H12z"/>
                            </svg>
                            Inloggen met Microsoft
                        </button>

                        {status && (
                            <p className="mt-4 text-center text-sm text-green-600">
                                {status}
                            </p>
                        )}
                    </div>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Geen account? Vraag je docent om een uitnodiging.
                    </p>
                </div>
            </div>
        </>
    );
}
