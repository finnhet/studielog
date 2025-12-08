import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Props {
  user: User;
  children: ReactNode;
}

interface PageProps {
  auth: {
    user: User;
  };
  flash?: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
}

export default function AuthenticatedLayout({ user, children }: Props) {
  const { flash } = (usePage().props as unknown) as PageProps;
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

  useEffect(() => {
    if (flash?.success || flash?.error || flash?.warning || flash?.info) {
      const type = flash.success ? 'success' : flash.error ? 'error' : flash.warning ? 'warning' : 'info';
      const message = flash.success || flash.error || flash.warning || flash.info || '';
      setNotification({ type, message });
      setShowNotification(true);

      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [flash]);
  const handleLogout = () => {
    router.post('/logout');
  };

  const isTeacher = user.role === 'teacher';

  return (
    <div className="min-h-screen">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-white drop-shadow-lg">StudieLog</span>
              </Link>

              <div className="hidden sm:ml-10 sm:flex sm:space-x-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/agenda"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                >
                  Agenda
                </Link>

                {isTeacher ? (
                  <>
                    <Link
                      href="/timeblocks"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                    >
                      Tijdblokken
                    </Link>
                    <Link
                      href="/classes"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                    >
                      Klassen
                    </Link>
                    <Link
                      href="/locations"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                    >
                      Vestigingen
                    </Link>
                    <Link
                      href="/summaries"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                    >
                      Verslagen
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/timeblocks"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                    >
                      Tijdblokken
                    </Link>
                    <Link
                      href="/reservations"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                    >
                      Mijn Reserveringen
                    </Link>
                    <Link
                      href="/summaries"
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 transition-all"
                    >
                      Verslagen
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="ml-3 relative flex items-center space-x-4">
                <span className="text-sm font-medium text-white drop-shadow">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showNotification && notification && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div
            className={`max-w-md px-6 py-4 rounded-lg shadow-lg border ${
              notification.type === 'success'
                ? 'bg-gray-50 border-gray-300 text-gray-800'
                : notification.type === 'error'
                ? 'bg-gray-100 border-gray-400 text-gray-900'
                : notification.type === 'warning'
                ? 'bg-gray-50 border-gray-300 text-gray-700'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' && (
                  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => setShowNotification(false)}
                  className="inline-flex text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>{children}</main>
    </div>
  );
}
