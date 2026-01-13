import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Clock, Calendar, FileText, Users, MapPin, CheckCircle, AlertCircle, ArrowRight, LayoutDashboard } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Timeblock {
  id: number;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  class: {
    name: string;
  };
  reservation?: {
    student: {
      name: string;
    };
  };
}

interface Summary {
  id: number;
  status: string;
  student: {
    name: string;
  };
  timeblock: {
    start_time: string;
    class: {
      name: string;
    };
  };
}

interface Props {
  auth: { user: User };
  upcomingTimeblocks: Timeblock[];
  pendingSummaries: Summary[];
  stats: {
    totalTimeblocks: number;
    totalReservations: number;
    pendingSummaries: number;
  };
}

export default function TeacherDashboard({ auth, upcomingTimeblocks, pendingSummaries, stats }: Props) {
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Dashboard" />

      <div className="py-4 sm:py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welkom, {auth.user.name}!</h2>
              <p className="text-gray-500 mt-1 text-base sm:text-lg">Hier is een overzicht van je activiteiten.</p>
            </div>
      
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Totaal Tijdblokken</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalTimeblocks}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-indigo-50 rounded-lg">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    </div>
                </div>
            </div>
            <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Reserveringen</p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalReservations}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                </div>
            </div>
            <div className="bg-white overflow-hidden shadow-sm rounded-xl p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Te beoordelen</p>
                        <p className="text-2xl sm:text-3xl font-bold text-orange-600 mt-1 sm:mt-2">{stats.pendingSummaries}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-50 rounded-lg">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Upcoming Timeblocks */}
            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        Aankomende Tijdblokken
                    </h3>
                    <Link href="/timeblocks" className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        <span className="hidden sm:inline">Alles bekijken</span> <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="p-4 sm:p-6 flex-1">
                    {upcomingTimeblocks.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-sm sm:text-base">Geen aankomende tijdblokken</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {upcomingTimeblocks.map((timeblock) => (
                                <div key={timeblock.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-100 hover:border-indigo-200 transition-colors">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {timeblock.class.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{timeblock.location}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(timeblock.start_time).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {timeblock.reservation && (
                                            <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                                                <Users className="w-3 h-3" />
                                                <span className="truncate">{timeblock.reservation.student.name}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full flex-shrink-0 ${
                                        timeblock.status === 'available' ? 'bg-green-100 text-green-700' :
                                        timeblock.status === 'reserved' ? 'bg-orange-100 text-orange-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {timeblock.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Pending Summaries */}
            <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 flex flex-col">
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        Verslagen te beoordelen
                    </h3>
                    <Link href="/summaries" className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                        <span className="hidden sm:inline">Alles bekijken</span> <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="p-4 sm:p-6 flex-1">
                    {pendingSummaries.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-green-300 mb-3" />
                            <p className="text-sm sm:text-base">Je bent helemaal bij!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {pendingSummaries.map((summary) => (
                                <div key={summary.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-orange-50 border border-orange-100 hover:border-orange-200 transition-colors">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {summary.student.name}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                                            {summary.timeblock.class.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(summary.timeblock.start_time).toLocaleDateString('nl-NL')}
                                        </p>
                                    </div>
                                    <Link 
                                        href="/summaries"
                                        className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-orange-600 text-xs font-medium rounded-lg border border-orange-200 hover:bg-orange-50 transition-colors flex-shrink-0"
                                    >
                                        Beoordelen
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/timeblocks" className="group p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors mb-2 sm:mb-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Tijdblokken</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Beheer beschikbaarheid</p>
            </Link>
            <Link href="/classes" className="group p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors mb-2 sm:mb-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Klassen</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Beheer klassen</p>
            </Link>
            <Link href="/locations" className="group p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors mb-2 sm:mb-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Vestigingen</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Beheer locaties</p>
            </Link>
            <Link href="/summaries" className="group p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 transition-colors mb-2 sm:mb-3">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Verslagen</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Alle verslagen</p>
            </Link>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
