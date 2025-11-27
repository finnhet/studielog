import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { LayoutDashboard, Calendar, Clock, Users, MapPin, FileText, LogOut, Menu, X } from 'lucide-react';

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
  const { props, url } = usePage<PageProps>();
  const { flash } = props;
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                    <LayoutDashboard className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">StudieLog</span>
              </Link>

              <div className="hidden sm:ml-10 sm:flex sm:space-x-1">
                <NavLink href="/dashboard" active={url === '/dashboard'}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                </NavLink>
                <NavLink href="/agenda" active={url.startsWith('/agenda')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Agenda
                </NavLink>

                {isTeacher ? (
                  <>
                    <NavLink href="/timeblocks" active={url.startsWith('/timeblocks')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Tijdblokken
                    </NavLink>
                    <NavLink href="/classes" active={url.startsWith('/classes')}>
                        <Users className="w-4 h-4 mr-2" />
                        Klassen
                    </NavLink>
                    <NavLink href="/locations" active={url.startsWith('/locations')}>
                        <MapPin className="w-4 h-4 mr-2" />
                        Vestigingen
                    </NavLink>
                    <NavLink href="/summaries" active={url.startsWith('/summaries')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Verslagen
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink href="/reservations" active={url.startsWith('/reservations')}>
                        <Clock className="w-4 h-4 mr-2" />
                        Reserveringen
                    </NavLink>
                    <NavLink href="/summaries" active={url.startsWith('/summaries')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Verslagen
                    </NavLink>
                  </>
                )}
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-700 text-right">
                    <span className="block font-medium">{user.name}</span>
                    <span className="block text-xs text-gray-500 capitalize">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Uitloggen"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              <MobileNavLink href="/dashboard" active={url === '/dashboard'}>
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/agenda" active={url.startsWith('/agenda')}>
                Agenda
              </MobileNavLink>
              {isTeacher ? (
                  <>
                    <MobileNavLink href="/timeblocks" active={url.startsWith('/timeblocks')}>Tijdblokken</MobileNavLink>
                    <MobileNavLink href="/classes" active={url.startsWith('/classes')}>Klassen</MobileNavLink>
                    <MobileNavLink href="/locations" active={url.startsWith('/locations')}>Vestigingen</MobileNavLink>
                    <MobileNavLink href="/summaries" active={url.startsWith('/summaries')}>Verslagen</MobileNavLink>
                  </>
              ) : (
                  <>
                    <MobileNavLink href="/reservations" active={url.startsWith('/reservations')}>Reserveringen</MobileNavLink>
                    <MobileNavLink href="/summaries" active={url.startsWith('/summaries')}>Verslagen</MobileNavLink>
                  </>
              )}
            </div>
            <div className="pt-4 pb-4 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Notification Toast */}
      {showNotification && notification && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-in-out animate-in slide-in-from-right-full ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          notification.type === 'warning' ? 'bg-orange-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{notification.message}</p>
            <button onClick={() => setShowNotification(false)} className="ml-4 opacity-80 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
            {children}
        </Link>
    );
}

function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
    return (
        <Link
            href={href}
            className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                active
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
            }`}
        >
            {children}
        </Link>
    );
}

// Helper icons for toast
function CheckCircle({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}

function AlertCircle({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
