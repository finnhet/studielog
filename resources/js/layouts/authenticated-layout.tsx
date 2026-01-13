import { Link, router, usePage } from '@inertiajs/react';
import { ReactNode, useEffect, useState } from 'react';
import { LayoutDashboard, Calendar, Clock, Users, MapPin, FileText, LogOut, Menu, X, CheckCircle, AlertCircle } from 'lucide-react';

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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">{user.name.charAt(0)}</span>
                  </div>
                  <div className="text-sm text-gray-700 text-left">
                      <span className="block font-medium">{user.name}</span>
                      <span className="block text-xs text-gray-500 capitalize">{user.role}</span>
                  </div>
                </button>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Uitloggen
                      </button>
                    </div>
                  </>
                )}
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
        <div className={`sm:hidden border-t border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-2 pb-3 space-y-1 px-2">
              <MobileNavLink href="/dashboard" active={url === '/dashboard'}>
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </MobileNavLink>
              <MobileNavLink href="/agenda" active={url.startsWith('/agenda')}>
                <Calendar className="w-5 h-5" />
                Agenda
              </MobileNavLink>
              {isTeacher ? (
                  <>
                    <MobileNavLink href="/timeblocks" active={url.startsWith('/timeblocks')}>
                      <Clock className="w-5 h-5" />
                      Tijdblokken
                    </MobileNavLink>
                    <MobileNavLink href="/classes" active={url.startsWith('/classes')}>
                      <Users className="w-5 h-5" />
                      Klassen
                    </MobileNavLink>
                    <MobileNavLink href="/locations" active={url.startsWith('/locations')}>
                      <MapPin className="w-5 h-5" />
                      Vestigingen
                    </MobileNavLink>
                    <MobileNavLink href="/summaries" active={url.startsWith('/summaries')}>
                      <FileText className="w-5 h-5" />
                      Verslagen
                    </MobileNavLink>
                  </>
              ) : (
                  <>
                    <MobileNavLink href="/reservations" active={url.startsWith('/reservations')}>
                      <Clock className="w-5 h-5" />
                      Reserveringen
                    </MobileNavLink>
                    <MobileNavLink href="/summaries" active={url.startsWith('/summaries')}>
                      <FileText className="w-5 h-5" />
                      Verslagen
                    </MobileNavLink>
                  </>
              )}
            </div>
            <div className="pt-4 pb-4 border-t border-gray-200 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-semibold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500 truncate max-w-[200px]">{user.email}</div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Uitloggen
                </button>
              </div>
            </div>
        </div>
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

      <main className="py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
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
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
            }`}
        >
            {children}
        </Link>
    );
}
